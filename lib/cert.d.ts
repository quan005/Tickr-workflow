export interface caCert {
    caCertificate: string;
    caPrivateKey: string;
}
export interface cert {
    certificate: string;
    privateKey: string;
}
export declare const CreateCaCertificate: () => {
    caCertificate: any;
    caPrivateKey: any;
};
export declare const CreateSignedCertificate: (caCertificate: caCert) => {
    certificate: any;
    privateKey: any;
};
//# sourceMappingURL=cert.d.ts.map