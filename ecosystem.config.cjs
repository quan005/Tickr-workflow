module.exports = {
    apps : [
        {
            name: 'worker1',
            script: 'node -r tsconfig-paths/register -P ./tsconfig.json ./lib/worker.js',
            watch: true,
        },
        {
            name: 'worker2',
            script: 'node -r tsconfig-paths/register -P ./tsconfig.json ./lib/worker.js',
            watch: true,
        },
        {
            name: 'worker3',
            script: 'node -r tsconfig-paths/register -P ./tsconfig.json ./lib/worker.js',
            watch: true,
        },
        {
            name: 'client1',
            script: 'node -r tsconfig-paths/register -P ./tsconfig.json ./lib/client.js',
            watch: true,
        },
        {
            name: 'client2',
            script: 'node -r tsconfig-paths/register -P ./tsconfig.json ./lib/client.js',
            watch: true,
        },
    ]
};