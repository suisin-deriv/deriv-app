export type TFormValidation = {
    warnings: { [key: string]: string };
    errors: { [key: string]: string };
};

export type TToken = {
    display_name: string;
    last_used: string;
    scopes: string[];
    token: string;
};

export type TFile = {
    path: string;
    lastModified: number;
    lastModifiedDate: Date;
    name: string;
    size: number;
    type: string;
    webkitRelativePath: string;
};

export type TPlatformContext = {
    is_appstore?: boolean;
    displayName?: string;
};
