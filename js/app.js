var ca = new carina.Carina().open();
ca.subscribe('channel:1:update', function (data) {
    console.log('Channel update', data);
});