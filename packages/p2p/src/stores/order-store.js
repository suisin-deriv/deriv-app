import { cloneObject } from '@deriv/shared';
import { action, computed, observable, reaction } from 'mobx';
import { createExtendedOrderDetails } from 'Utils/orders';
import { requestWS, subscribeWS } from 'Utils/websocket';
import { order_list } from 'Constants/order-list';

export default class OrderStore {
    constructor(root_store) {
        this.root_store = root_store;

        reaction(
            () => this.orders,
            orders => {
                this.root_store.general_store.handleNotifications(this.previous_orders, orders);
            }
        );
    }

    @observable api_error_message = '';
    @observable cancellation_block_duration = 0;
    @observable cancellation_count_period = 0;
    @observable cancellation_limit = 0;
    @observable cancels_remaining = null;
    @observable error_message = '';
    @observable has_more_items_to_load = false;
    @observable is_email_link_blocked_modal_open = false;
    @observable is_email_link_verified_modal_open = false;
    @observable is_email_verification_modal_open = false;
    @observable is_invalid_verification_link_modal_open = false;
    @observable is_loading = false;
    @observable is_loading_modal_open = false;
    @observable is_rating_modal_open = false;
    @observable is_recommended = undefined;
    @observable orders = [];
    @observable order_id = null;
    @observable order_payment_method_details = null;
    @observable order_rerender_timeout = null;
    @observable rating_value = 0;
    @observable user_email_address = '';
    @observable verification_code = '';
    @observable verification_link_error_message = '';

    interval;
    order_info_subscription = {};
    previous_orders = [];

    @computed
    get has_order_payment_method_details() {
        return !!this.order_payment_method_details;
    }

    @computed
    get order_information() {
        const { general_store } = this.root_store;
        const order = this.orders.find(o => o.id === this.order_id);
        return order
            ? createExtendedOrderDetails(order, general_store.client.loginid, general_store.props.server_time)
            : null;
    }

    @computed
    get nav() {
        return this.root_store.general_store.parameters?.nav;
    }

    @action.bound
    confirmOrderRequest(id, is_buy_order_for_user) {
        const { order_details_store } = this.root_store;
        requestWS({
            p2p_order_confirm: 1,
            id,
        }).then(response => {
            if (response) {
                if (response.error) {
                    if (response.error.code === 'OrderEmailVerificationRequired') {
                        clearTimeout(wait);
                        const wait = setTimeout(() => this.setIsEmailVerificationModalOpen(true), 250);
                    } else if (
                        response?.error.code === 'InvalidVerificationToken' ||
                        response?.error.code === 'ExcessiveVerificationRequests'
                    ) {
                        clearTimeout(wait);
                        if (this.is_email_verification_modal_open) {
                            this.setIsEmailVerificationModalOpen(false);
                        }
                        if (this.is_email_link_verified_modal_open) {
                            this.setIsEmailLinkVerifiedModalOpen(false);
                        }
                        this.setVerificationLinkErrorMessage(response.error.message);
                        const wait = setTimeout(() => this.setIsInvalidVerificationLinkModalOpen(true), 230);
                    } else if (response?.error.code === 'ExcessiveVerificationFailures') {
                        if (this.is_invalid_verification_link_modal_open) {
                            this.setIsInvalidVerificationLinkModalOpen(false);
                        }
                        clearTimeout(wait);
                        this.setVerificationLinkErrorMessage(response.error.message);
                        const wait = setTimeout(() => this.setIsEmailLinkBlockedModalOpen(true), 230);
                    } else {
                        order_details_store.setErrorMessage(response.error.message);
                    }
                } else if (!is_buy_order_for_user) {
                    this.setIsRatingModalOpen(true);
                }

                localStorage.removeItem('verification_code.p2p_order_confirm');
            }
        });
    }

    @action.bound
    confirmOrder(is_buy_order_for_user) {
        requestWS({
            p2p_order_confirm: 1,
            id: this.order_id,
            verification_code: this.verification_code,
        }).then(response => {
            if (response && !response.error) {
                if (!is_buy_order_for_user) {
                    clearTimeout(wait);
                    const wait = setTimeout(() => {
                        this.setIsRatingModalOpen(true);
                    }, 230);
                }
            }
        });
    }

    @action.bound
    getAdvertiserInfo(setShouldShowCancelModal) {
        requestWS({ p2p_advertiser_info: 1 }).then(response => {
            if (response.error) {
                this.setErrorMessage(response.error.message);
            } else {
                this.setCancelsRemaining(response.p2p_advertiser_info.cancels_remaining);
            }
        });
        this.getWebsiteStatus(setShouldShowCancelModal);
    }

    @action.bound
    getP2POrderList() {
        requestWS({ p2p_order_list: 1 }).then(response => {
            if (response) {
                if (response.error) {
                    this.setErrorMessage(response.error.message);
                } else {
                    const { p2p_order_list } = response;

                    this.root_store.general_store.handleNotifications(this.orders, p2p_order_list.list);
                    p2p_order_list.list.forEach(order => this.syncOrder(order));
                    this.setOrders(p2p_order_list.list);
                }
            }
        });
    }

    @action.bound
    getSettings() {
        requestWS({ get_settings: 1 }).then(response => {
            if (response && !response.error) {
                this.setUserEmailAddress(response.get_settings.email);
            }
        });
    }

    @action.bound
    getWebsiteStatus(setShouldShowCancelModal) {
        requestWS({ website_status: 1 }).then(response => {
            if (response.error) {
                this.setErrorMessage(response.error.message);
            } else {
                const { p2p_config } = response.website_status;
                this.setCancellationBlockDuration(p2p_config.cancellation_block_duration);
                this.setCancellationCountPeriod(p2p_config.cancellation_count_period);
                this.setCancellationLimit(p2p_config.cancellation_limit);
            }
            if (typeof setShouldShowCancelModal === 'function') {
                setShouldShowCancelModal(true);
            }
        });
    }

    @action.bound
    handleRating(rate) {
        this.setRatingValue(rate);
    }

    @action.bound
    hideDetails(should_navigate) {
        if (should_navigate && this.nav) {
            this.root_store.general_store.redirectTo(this.nav.location);
        }
        this.setOrderId(null);
    }

    @action.bound
    loadMoreOrders({ startIndex }) {
        this.setApiErrorMessage('');
        return new Promise(resolve => {
            const { general_store } = this.root_store;
            const active = general_store.is_active_tab ? 1 : 0;
            requestWS({
                p2p_order_list: 1,
                active,
                offset: startIndex,
                limit: general_store.list_item_limit,
            }).then(response => {
                if (!response.error) {
                    // Ignore any responses that don't match our request. This can happen
                    // due to quickly switching between Active/Past tabs.
                    if (response.echo_req.active === active) {
                        const { list } = response.p2p_order_list;
                        this.setHasMoreItemsToLoad(list.length >= general_store.list_item_limit);

                        const old_list = [...this.orders];
                        const new_list = [];

                        list.forEach(order => {
                            const old_list_idx = old_list.findIndex(o => o.id === order.id);

                            if (old_list_idx > -1) {
                                old_list[old_list_idx] = order;
                            } else {
                                new_list.push(order);
                            }
                        });

                        this.setOrders([...old_list, ...new_list]);
                    }
                } else if (response.error.code === 'PermissionDenied') {
                    this.root_store.general_store.setIsBlocked(true);
                } else {
                    this.setApiErrorMessage(response.error.message);
                }

                this.setIsLoading(false);
                resolve();
            });
        });
    }

    @action.bound
    onOrderIdUpdate() {
        this.unsubscribeFromCurrentOrder();

        if (this.order_id) {
            this.subscribeToCurrentOrder();
        }
    }

    @action.bound
    async onOrdersUpdate() {
        if (this.order_id) {
            // If orders was updated, find current viewed order (if any)
            // and trigger a re-render (in case status was updated).

            await requestWS({ p2p_order_info: 1, id: this.order_id }).then(response => {
                if (!response?.error) {
                    const { p2p_order_info } = response;
                    if (p2p_order_info) {
                        this.setQueryDetails(p2p_order_info);
                    } else {
                        this.root_store.general_store.redirectTo('orders');
                    }
                }
            });
        }
    }

    @action.bound
    onPageReturn() {
        this.hideDetails(true);
    }

    @action.bound
    onUnmount() {
        clearTimeout(this.order_rerender_timeout);
        this.unsubscribeFromCurrentOrder();
        this.hideDetails(false);
    }

    @action.bound
    setOrderDetails(response) {
        if (response) {
            if (!response?.error) {
                const { p2p_order_info } = response;

                this.setQueryDetails(p2p_order_info);
            } else {
                this.unsubscribeFromCurrentOrder();
            }
        }
    }

    @action.bound
    setOrderRating(id) {
        const rating = this.rating_value / 20;

        requestWS({
            p2p_order_review: 1,
            order_id: id,
            rating,
            ...(this.is_recommended === undefined ? {} : { recommended: this.is_recommended }),
        }).then(response => {
            if (response) {
                if (response.error) {
                    this.setErrorMessage(response.error.message);
                }
                this.getP2POrderList();
                this.setIsRatingModalOpen(false);
                this.setRatingValue(0);
            }
        });
    }

    @action.bound
    setQueryDetails(input_order) {
        const { general_store } = this.root_store;
        const order_information = createExtendedOrderDetails(
            input_order,
            general_store.client.loginid,
            general_store.props.server_time
        );
        this.setOrderId(order_information.id); // Sets the id in URL
        if (order_information.is_active_order) {
            general_store.setOrderTableType(order_list.ACTIVE);
        } else {
            general_store.setOrderTableType(order_list.INACTIVE);
        }
        if (order_information?.payment_method_details) {
            this.setOrderPaymentMethodDetails(Object.values(order_information?.payment_method_details));
        }
        // When viewing specific order, update its read state in localStorage.
        const { notifications } = this.root_store.general_store.getLocalStorageSettingsForLoginId();

        if (notifications.length) {
            const notification = notifications.find(n => n.order_id === order_information.id);

            if (notification) {
                notification.is_seen = true;
                this.root_store.general_store.updateP2pNotifications(notifications);
            }
        }

        // Force a refresh of this order when it's expired to correctly
        // reflect the status of the order. This is to work around a BE issue
        // where they only expire contracts once a minute rather than on expiry time.
        const { remaining_seconds } = order_information;

        if (remaining_seconds > 0) {
            clearTimeout(this.order_rerender_timeout);

            this.setOrderRendererTimeout(
                setTimeout(() => {
                    if (typeof this.forceRerenderFn === 'function') {
                        this.forceRerenderFn(order_information.id);
                    }
                }, (remaining_seconds + 1) * 1000)
            );
        }
    }

    @action.bound
    subscribeToCurrentOrder() {
        this.order_info_subscription = subscribeWS(
            {
                p2p_order_info: 1,
                id: this.order_id,
                subscribe: 1,
            },
            [this.setOrderDetails]
        );
    }

    @action.bound
    syncOrder(p2p_order_info) {
        const { general_store } = this.root_store;

        const get_order_status = createExtendedOrderDetails(
            p2p_order_info,
            general_store.client.loginid,
            general_store.props.server_time
        );

        const order_idx = this.orders.findIndex(order => order.id === p2p_order_info.id);

        // Checking for null since that's the initial value, we don't want to check for !this.order_id
        // since it can be undefined or any other value that we wouldn't need
        if (this.order_id === null) {
            // When we're looking at a list, it's safe to move orders from Active to Past.
            if (order_idx === -1) {
                this.orders.unshift(p2p_order_info);
            } else if (
                (get_order_status.is_completed_order && get_order_status.has_review_details) ||
                !get_order_status.is_reviewable
            ) {
                Object.assign(this.orders[order_idx], p2p_order_info);
            } else if (get_order_status.is_disputed_order || get_order_status.is_active_order) {
                Object.assign(this.orders[order_idx], p2p_order_info);
            } else if (get_order_status.is_inactive_order) {
                this.orders.splice(order_idx, 1);
            }
        } else if (this.orders[order_idx]) {
            // When looking at a specific order, it's NOT safe to move orders between tabs
            // in this case, only update the order details.
            Object.assign(this.orders[order_idx], p2p_order_info);
        }

        if (get_order_status.is_completed_order && !get_order_status.is_reviewable) {
            // Remove notification once order review period is finished
            const notification_key = `order-${p2p_order_info.id}`;
            general_store.props.removeNotificationMessage({ key: notification_key });
            general_store.props.removeNotificationByKey({ key: notification_key });
        }
    }

    @action.bound
    unsubscribeFromCurrentOrder() {
        clearTimeout(this.order_rerender_timeout);

        if (this.order_info_subscription.unsubscribe) {
            this.order_info_subscription.unsubscribe();
        }
    }

    @action.bound
    verifyEmailVerificationCode(verification_action, verification_code) {
        if (verification_action === 'p2p_order_confirm' && verification_code) {
            requestWS({
                p2p_order_confirm: 1,
                id: this.order_id,
                verification_code,
                dry_run: 1,
            }).then(response => {
                this.setIsLoadingModalOpen(false);
                if (response) {
                    if (!response.error) {
                        clearTimeout(wait);
                        const wait = setTimeout(() => this.setIsEmailLinkVerifiedModalOpen(true), 650);
                    } else if (
                        response.error.code === 'InvalidVerificationToken' ||
                        response.error.code === 'ExcessiveVerificationRequests'
                    ) {
                        clearTimeout(wait);
                        this.setVerificationLinkErrorMessage(response.error.message);
                        const wait = setTimeout(() => this.setIsInvalidVerificationLinkModalOpen(true), 750);
                    } else if (response.error.code === 'ExcessiveVerificationFailures') {
                        if (this.is_invalid_verification_link_modal_open) {
                            this.setIsInvalidVerificationLinkModalOpen(false);
                        }
                        clearTimeout(wait);
                        this.setVerificationLinkErrorMessage(response.error.message);
                        const wait = setTimeout(() => this.setIsEmailLinkBlockedModalOpen(true), 600);
                    }
                    localStorage.removeItem('verification_code.p2p_order_confirm');
                }
            });
        }
    }

    @action.bound
    setApiErrorMessage(api_error_message) {
        this.api_error_message = api_error_message;
    }

    @action.bound
    setCancellationBlockDuration(cancellation_block_duration) {
        this.cancellation_block_duration = cancellation_block_duration;
    }

    @action.bound
    setCancellationCountPeriod(cancellation_count_period) {
        this.cancellation_count_period = cancellation_count_period;
    }

    @action.bound
    setCancellationLimit(cancellation_limit) {
        this.cancellation_limit = cancellation_limit;
    }

    @action.bound
    setCancelsRemaining(cancels_remaining) {
        this.cancels_remaining = cancels_remaining;
    }

    @action.bound
    setData(data) {
        this.data = data;
    }

    @action.bound
    setErrorMessage(error_message) {
        this.error_message = error_message;
    }

    @action.bound
    setForceRerenderOrders(forceRerenderFn) {
        this.forceRerenderFn = forceRerenderFn;
    }

    @action.bound
    setHasMoreItemsToLoad(has_more_items_to_load) {
        this.has_more_items_to_load = has_more_items_to_load;
    }

    @action.bound
    setIsEmailLinkBlockedModalOpen(is_email_link_blocked_modal_open) {
        this.is_email_link_blocked_modal_open = is_email_link_blocked_modal_open;
    }

    @action.bound
    setIsEmailLinkVerifiedModalOpen(is_email_link_verified_modal_open) {
        this.is_email_link_verified_modal_open = is_email_link_verified_modal_open;
    }

    @action.bound
    setIsEmailVerificationModalOpen(is_email_verification_modal_open) {
        this.is_email_verification_modal_open = is_email_verification_modal_open;
    }

    @action.bound
    setIsInvalidVerificationLinkModalOpen(is_invalid_verification_link_modal_open) {
        this.is_invalid_verification_link_modal_open = is_invalid_verification_link_modal_open;
    }

    @action.bound
    setIsLoading(is_loading) {
        this.is_loading = is_loading;
    }

    @action.bound
    setIsLoadingModalOpen(is_loading_modal_open) {
        this.is_loading_modal_open = is_loading_modal_open;
    }

    @action.bound
    setIsRatingModalOpen(is_rating_modal_open) {
        this.is_rating_modal_open = is_rating_modal_open;
    }

    @action.bound
    setIsRecommended(is_recommended) {
        this.is_recommended = is_recommended;
    }

    @action.bound
    setOrders(orders) {
        this.previous_orders = cloneObject(this.orders);
        this.orders = orders;
    }

    @action.bound
    setOrderId(order_id) {
        this.order_id = order_id;

        const { general_store } = this.root_store;

        if (typeof general_store.props.setOrderId === 'function') {
            general_store.props.setOrderId(order_id);
        }
    }

    @action.bound
    setOrderPaymentMethodDetails(order_payment_method_details) {
        this.order_payment_method_details = order_payment_method_details;
    }

    @action.bound
    setOrderRendererTimeout(order_rerender_timeout) {
        this.order_rerender_timeout = order_rerender_timeout;
    }

    @action.bound
    setRatingValue(rating_value) {
        this.rating_value = rating_value;
    }

    @action.bound
    setUserEmailAddress(user_email_address) {
        this.user_email_address = user_email_address;
    }

    // This is only for the order confirmation request,
    // since on confirmation the code is removed from the query params
    @action.bound
    setVerificationCode(verification_code) {
        this.verification_code = verification_code;
    }

    @action.bound
    setVerificationLinkErrorMessage(verification_link_error_message) {
        this.verification_link_error_message = verification_link_error_message;
    }
}
