var ca = new carina.Carina().open();
ca.subscribe('channel:1:update', function (data) {
    console.log('Channel update', data);
});
ca.subscribe('channel:1:patronageUpdate', function (data) {
    console.log('Channel1 skill update', data);
});
ca.subscribe('channel:35122269:patronageUpdate', function (data) {
    console.log('Rebel skill update', data);
});
