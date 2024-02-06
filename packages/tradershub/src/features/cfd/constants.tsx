import React, { ComponentType, ReactNode, SVGAttributes } from 'react';
import CTraderIcon from '../../public/images/cfd/ctrader.svg';
import DerivXIcon from '../../public/images/cfd/derivx.svg';
import FinancialEUMT5Icon from '../../public/images/cfd/eu-mt5-financial.svg';
import DerivedMT5Icon from '../../public/images/cfd/mt5-derived.svg';
import FinancialMT5Icon from '../../public/images/cfd/mt5-financial.svg';
import SwapFreeMT5Icon from '../../public/images/cfd/mt5-swap-free.svg';
import CTraderLabelIcon from '../../public/images/ctrader-label.svg';
import DerivXLabelIcon from '../../public/images/derivx-label.svg';
import InstallationAppleIcon from '../../public/images/ic-installation-apple.svg';
import InstallationGoogleIcon from '../../public/images/ic-installation-google.svg';
import InstallationHuaweiIcon from '../../public/images/ic-installation-huawei.svg';
import LinuxIcon from '../../public/images/ic-linux-logo.svg';
import MacOSIcon from '../../public/images/ic-macos-logo.svg';
import MT5Icon from '../../public/images/ic-mt5.svg';
import WindowsIcon from '../../public/images/ic-windows-logo.svg';
import { TJurisdiction, TMarketTypes, TPlatforms } from '../../types';

type TAppContent = {
    description: string;
    icon: ReactNode;
    iconWithWidth?: (width: number) => JSX.Element;
    link: string;
    text: string;
    title: string;
};

type TPlatform = 'ctrader' | 'linux' | 'macos' | 'web' | 'windows';

export type TTM5FilterLandingCompany = Exclude<TJurisdiction, 'malta' | 'seychelles' | undefined>;
type TLandingCompanyDetails = { name: string; shortcode: string; tncUrl: string };

type TMarketTypeDetails = {
    [key in TMarketTypes.All]: Pick<TAppContent, 'description' | 'icon' | 'iconWithWidth' | 'title'>;
};

type TcompanyNamesAndUrls = {
    [key in TTM5FilterLandingCompany]: TLandingCompanyDetails;
};

type TAppToContentMapper = {
    [key in TPlatform]: Omit<TAppContent, 'description'>;
};

type TPlatformUrls = {
    [key in TPlatforms.OtherAccounts]: {
        demo?: string;
        live: string;
        staging?: string;
    };
};

export const CFDPlatforms = {
    CFDS: 'CFDs',
    CTRADER: 'ctrader',
    DXTRADE: 'dxtrade',
    MT5: 'mt5',
} as const;

export const MarketType = {
    ALL: 'all',
    FINANCIAL: 'financial',
    SYNTHETIC: 'synthetic',
} as const;

export const Category = {
    DEMO: 'demo',
    REAL: 'real',
} as const;

export const QueryStatus = {
    ERROR: 'error',
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
} as const;

export const MarketTypeDetails = (isEU?: boolean): TMarketTypeDetails => ({
    all: {
        description:
            'Trade swap-free CFDs on MT5 with forex, stocks, stock indices, commodities, cryptocurrencies, ETFs and synthetic indices.',
        icon: <SwapFreeMT5Icon />,
        iconWithWidth: (width: number) => <SwapFreeMT5Icon width={width} />,
        title: 'Swap-Free',
    },
    financial: {
        description: isEU
            ? 'This MFSA-regulated account offers CFDs on derived and financial instruments.'
            : 'This account offers CFDs on financial instruments.',
        icon: isEU ? <FinancialEUMT5Icon /> : <FinancialMT5Icon />,
        iconWithWidth: isEU
            ? (width: number) => <FinancialEUMT5Icon width={width} />
            : (width: number) => <FinancialMT5Icon width={width} />,
        title: isEU ? 'CFDs' : 'Financial',
    },
    synthetic: {
        description: 'This account offers CFDs on derived instruments.',
        icon: <DerivedMT5Icon />,
        iconWithWidth: (width: number) => <DerivedMT5Icon width={width} />,
        title: 'Derived',
    },
});

export const PlatformDetails = {
    ctrader: {
        icon: <CTraderIcon />,
        iconWithWidth: (width: number) => <CTraderIcon width={width} />,
        link: 'https://onelink.to/hyqpv7',
        platform: 'ctrader' as TPlatforms.OtherAccounts,
        title: 'Deriv cTrader',
    },
    dxtrade: {
        icon: <DerivXIcon />,
        iconWithWidth: (width: number) => <DerivXIcon width={width} />,
        link: 'https://onelink.to/grmtyx',
        platform: 'dxtrade' as TPlatforms.OtherAccounts,
        title: 'Deriv X',
    },
    mt5: {
        icon: <DerivedMT5Icon />,
        iconWithWidth: (width: number) => <DerivedMT5Icon width={width} />,
        link: 'https://onelink.to/grmtyx',
        platform: 'mt5' as TPlatforms.MT5,
        title: 'Deriv MT5',
    },
};

export const companyNamesAndUrls: TcompanyNamesAndUrls = {
    bvi: { name: 'Deriv (BVI) Ltd', shortcode: 'BVI', tncUrl: 'tnc/deriv-(bvi)-ltd.pdf' },
    labuan: { name: 'Deriv (FX) Ltd', shortcode: 'Labuan', tncUrl: 'tnc/deriv-(fx)-ltd.pdf' },
    maltainvest: {
        name: 'Deriv Investments (Europe) Limited',
        shortcode: 'Maltainvest',
        tncUrl: 'tnc/deriv-investments-(europe)-limited.pdf',
    },
    svg: { name: 'Deriv (SVG) LLC', shortcode: 'SVG', tncUrl: 'tnc/deriv-(svg)-llc.pdf' },
    vanuatu: { name: 'Deriv (V) Ltd', shortcode: 'Vanuatu', tncUrl: 'tnc/general-terms.pdf' },
};

export const AppToContentMapper: TAppToContentMapper = {
    ctrader: {
        icon: <WindowsIcon />,
        link: 'https://getctrader.com/deriv/ctrader-deriv-setup.exe',
        text: 'Download',
        title: 'CTrader Windows App',
    },
    linux: {
        icon: <LinuxIcon />,
        link: 'https://www.metatrader5.com/en/terminal/help/start_advanced/install_linux',
        text: 'Learn more',
        title: 'MetaTrader 5 Linux app',
    },
    macos: {
        icon: <MacOSIcon />,
        link: 'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/MetaTrader5.dmg',
        text: 'Download',
        title: 'MetaTrader 5 MacOS app',
    },
    web: {
        icon: <MT5Icon />,
        link: '',
        text: 'Open',
        title: 'MetaTrader 5 web',
    },
    windows: {
        icon: <WindowsIcon />,
        link: 'https://download.mql5.com/cdn/web/deriv.com.limited/mt5/deriv5setup.exe',
        text: 'Download',
        title: 'MetaTrader 5 Windows app',
    },
};

export const PlatformToLabelIconMapper: Record<TPlatforms.OtherAccounts, ReactNode> = {
    ctrader: <CTraderLabelIcon />,
    dxtrade: <DerivXLabelIcon />,
};

export const PlatformUrls: TPlatformUrls = {
    ctrader: {
        live: 'https://ct.deriv.com',
        staging: 'https://ct-uat.deriv.com',
    },
    dxtrade: {
        demo: 'https://dx-demo.deriv.com',
        live: 'https://dx.deriv.com',
    },
};

export const Jurisdiction = {
    BVI: 'bvi',
    LABUAN: 'labuan',
    MALTAINVEST: 'maltainvest',
    SVG: 'svg',
    VANUATU: 'vanuatu',
} as const;

export type TAppLinks = {
    android: string;
    huawei?: string;
    ios: string;
};

export const LinksMapper: Record<TPlatforms.All, TAppLinks> = {
    ctrader: {
        android: 'https://play.google.com/store/apps/details?id=com.deriv.ct',
        ios: 'https://apps.apple.com/cy/app/ctrader/id767428811',
    },
    dxtrade: {
        android: 'https://play.google.com/store/apps/details?id=com.deriv.dx',
        huawei: 'https://appgallery.huawei.com/app/C104633219',
        ios: 'https://apps.apple.com/us/app/deriv-x/id1563337503',
    },
    mt5: {
        android: 'https://download.mql5.com/cdn/mobile/mt5/android?server=Deriv-Demo,Deriv-Server,Deriv-Server-02',
        huawei: 'https://appgallery.huawei.com/#/app/C102015329',
        ios: 'https://download.mql5.com/cdn/mobile/mt5/ios?server=Deriv-Demo,Deriv-Server,Deriv-Server-02',
    },
};

export const AppToIconMapper: Record<string, ComponentType<SVGAttributes<SVGElement>>> = {
    android: InstallationGoogleIcon,
    huawei: InstallationHuaweiIcon,
    ios: InstallationAppleIcon,
};
