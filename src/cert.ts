import * as crypto from "crypto";
import { pki, md } from "node-forge";
import * as fs from "node:fs";
import * as path from "path";

export interface caCert {
  caCertificate: string;
  caPrivateKey: string;
}

export interface cert {
  certificate: string;
  privateKey: string;
}

const getSerial = () => crypto.randomBytes(Math.ceil(16 / 2)).toString("hex").slice(0, 16).toUpperCase();
const keys = pki.rsa.generateKeyPair(2048);

export const CreateCaCertificate = () => {
  const certificate = pki.createCertificate();
  certificate.publicKey = keys.publicKey;
  certificate.serialNumber = getSerial();
  certificate.validity.notBefore = new Date();
  certificate.validity.notAfter = new Date();
  certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: "Hashicorp" },
    { name: 'organizationName', value: "HashiCorp, Inc." },
    { name: 'countryName', value: "US" },
  ]

  certificate.setSubject(attrs);
  certificate.setIssuer(attrs);
  certificate.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true,
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
  certificate.sign(keys.privateKey, md.sha256.create());

  const ca = pki.certificateToPem(certificate);
  const privateKey = pki.privateKeyToPem(keys.privateKey);

  return {
    caCertificate: ca,
    caPrivateKey: privateKey
  }
};

export const CreateSignedCertificate = (caCertificate: caCert) => {
  const certificate = pki.createCertificate();
  certificate.publicKey = keys.publicKey;
  certificate.serialNumber = getSerial();
  certificate.validity.notBefore = new Date();
  certificate.validity.notAfter = new Date();
  certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: "Tickr" },
    { name: 'organizationName', value: "Tickr LLC" },
    { name: 'countryName', value: "US" },
  ];

  const caPrivateKey = pki.privateKeyFromPem(caCertificate.caPrivateKey);
  const caCert = pki.certificateFromPem(caCertificate.caCertificate);
  const issuerAttrs = caCert.subject.attributes;

  certificate.setSubject(attrs);
  certificate.setIssuer(issuerAttrs);
  certificate.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true,
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
          value: "localhost",
        },
        {
          type: 2,
          value: "localhost.localdomain",
        },
      ],
    },
  ]);

  certificate.sign(caPrivateKey, md.sha256.create());

  const pem = pki.certificateToPem(certificate);
  const privateKey = pki.privateKeyToPem(keys.privateKey);

  try {
    if (!fs.existsSync(path.resolve(__dirname, './certs'))) {
      fs.mkdirSync(path.resolve(__dirname, './certs'));
    }
  } catch (err) {
    console.error('creating cert directory error', err);
  }

  fs.writeFile(path.resolve(__dirname, './certs/cert.pem'), pem, err => {
    if (err) {
      console.log('Cert write to file error', err);
    }
  });

  fs.writeFile(path.resolve(__dirname, './certs/privkey.pem'), privateKey, err => {
    if (err) {
      console.log('Private key write to file error', err);
    }
  });

  return {
    certificate: pem,
    privateKey: privateKey
  }
};

// const ca = CreateCaCertificate();

// const signed = CreateSignedCertificate(ca);

// console.log(signed);