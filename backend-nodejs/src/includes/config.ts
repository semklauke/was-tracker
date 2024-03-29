import path from 'path';

export default {
    // path of sqlite3 database file relaive to the project root
    "db" : 'tracker.db',

    // path of the lof folder relative to the project root
    "log_folder" : "log",

    // is the appliaction in debbuging mode (true/false)
    "debug" : false,

    // start http server
    "http" : true,

    // start https server
    "https": true,

    // port the backend server is running on
    "port" : {
        "http" : 80,
        "https" : 443
    },

    // paths to the ssl private key and certificate, relative to the project root
    "ssl" : {
        "cert" : path.join('keys', 'cert.pem'),
        "key" : path.join('keys', 'key.pem')
    },

    // make service available via ipv4 AND ipv6
    "ipv6": true,

    // the ip the service is accessed by
    "ip": {
        "ipv4": "0.0.0.0",
        "ipv6": "0000:0000:0000:0000:0000:0000:0000:0000",
    },

    // password for the front end side. pls change this
    "password" : "abcd",

    // build outputr folder for the vue frontend, relative to the project root
    "frontend_folder" : "../frontend-mobile/dist"
};
    