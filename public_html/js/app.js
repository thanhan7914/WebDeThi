//
$('.img-news').click(function() {
  let a = $(this).find('a').attr('href');
  location.href = a;
});

Array.prototype.slice.call($('.news-content').find('img')).forEach((elem) => {
  let $this = $(elem);

  if(!$this.hasClass('img-responsive') && $this.width() > $('.news-content').width())
    $this.addClass('img-responsive');
})
