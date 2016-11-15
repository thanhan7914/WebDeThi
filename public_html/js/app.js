//
$('.img-news').click(function() {
  let a = $(this).find('a').attr('href');
  location.href = a;
});
