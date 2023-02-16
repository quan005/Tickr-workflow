"use strict";
exports.__esModule = true;
exports.CreateSignedCertificate = exports.CreateCaCertificate = void 0;
var crypto = require("crypto");
var node_forge_1 = require("node-forge");
var fs = require("node:fs");
var path = require("path");
var getSerial = function () { return crypto.randomBytes(Math.ceil(16 / 2)).toString("hex").slice(0, 16).toUpperCase(); };
var keys = node_forge_1.pki.rsa.generateKeyPair(2048);
var CreateCaCertificate = function () {
    var certificate = node_forge_1.pki.createCertificate();
    certificate.publicKey = keys.publicKey;
    certificate.serialNumber = getSerial();
    certificate.validity.notBefore = new Date();
    certificate.validity.notAfter = new Date();
    certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);
    var attrs = [
        { name: 'commonName', value: "Hashicorp" },
        { name: 'organizationName', value: "HashiCorp, Inc." },
        { name: 'countryName', value: "US" },
    ];
    certificate.setSubject(attrs);
    certificate.setIssuer(attrs);
    certificate.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: "keyUsage",
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: "extKeyUsage",
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        }
    ]);
    certificate.sign(keys.privateKey, node_forge_1.md.sha256.create());
    var ca = node_forge_1.pki.certificateToPem(certificate);
    var privateKey = node_forge_1.pki.privateKeyToPem(keys.privateKey);
    return {
        caCertificate: ca,
        caPrivateKey: privateKey
    };
};
exports.CreateCaCertificate = CreateCaCertificate;
var CreateSignedCertificate = function (caCertificate) {
    var certificate = node_forge_1.pki.createCertificate();
    certificate.publicKey = keys.publicKey;
    certificate.serialNumber = getSerial();
    certificate.validity.notBefore = new Date();
    certificate.validity.notAfter = new Date();
    certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);
    var attrs = [
        { name: 'commonName', value: "Tickr" },
        { name: 'organizationName', value: "Tickr LLC" },
        { name: 'countryName', value: "US" },
    ];
    var caPrivateKey = node_forge_1.pki.privateKeyFromPem(caCertificate.caPrivateKey);
    var caCert = node_forge_1.pki.certificateFromPem(caCertificate.caCertificate);
    var issuerAttrs = caCert.subject.attributes;
    certificate.setSubject(attrs);
    certificate.setIssuer(issuerAttrs);
    certificate.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: "keyUsage",
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: "extKeyUsage",
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        },
        {
            name: "subjectAltName",
            altNames: [
                {
                    type: 2,
                    value: "localhost"
                },
                {
                    type: 2,
                    value: "localhost.localdomain"
                },
            ]
        },
    ]);
    certificate.sign(caPrivateKey, node_forge_1.md.sha256.create());
    var pem = node_forge_1.pki.certificateToPem(certificate);
    var privateKey = node_forge_1.pki.privateKeyToPem(keys.privateKey);
    try {
        if (!fs.existsSync(path.resolve(__dirname, './certs'))) {
            fs.mkdirSync(path.resolve(__dirname, './certs'));
        }
    }
    catch (err) {
        console.error('creating cert directory error', err);
    }
    fs.writeFile(path.resolve(__dirname, './certs/cert.pem'), pem, function (err) {
        if (err) {
            console.log('Cert write to file error', err);
        }
    });
    fs.writeFile(path.resolve(__dirname, './certs/privkey.pem'), privateKey, function (err) {
        if (err) {
            console.log('Private key write to file error', err);
        }
    });
    return {
        certificate: pem,
        privateKey: privateKey
    };
};
exports.CreateSignedCertificate = CreateSignedCertificate;
// const ca = CreateCaCertificate();
// const signed = CreateSignedCertificate(ca);
// console.log(signed);
//# sourceMappingURL=cert.js.map