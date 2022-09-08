import https from "https"
import fs from "fs"
import path from "path"
import { constants } from "crypto"

import { expressServer } from "./server"

const port = process.env.PORT || 4000;

const server = https.createServer({
  key: fs.readFileSync(path.resolve(__dirname + "/certs/localhost/localhost.decrypted.key"), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname + "/certs/localhost/localhost.crt"), 'utf8'),
  secureOptions: constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
  passphrase: 'white wolf red eyes'
}, expressServer)

server.listen(port, () => {
  console.log(`Listening at ${port}`);
});