module.exports = {
    apps : [
        {
            name: 'worker1',
            script: 'npm -- run start:worker'
        },
        {
            name: 'worker2',
            script: 'npm -- run start:worker'
        },
        {
            name: 'worker3',
            script: 'npm -- run start:worker'
        },
        {
            name: 'client1',
            script: 'npm -- run start:client'
        },
        {
            name: 'client2',
            script: 'npm -- run start:client'
        }
    ]
};