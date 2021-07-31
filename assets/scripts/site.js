$(function () {
    // Get today's date
    const date = luxon.DateTime.now().setZone('America/Chicago').toFormat('dd LLL. yyyy');
    $('#today').text(date);
});
