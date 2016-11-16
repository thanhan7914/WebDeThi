/**
* @author Thanh An
* @datetime 15/11/2016
**/

function $Pagination(pagination, pages, curpage) {
  if(typeof pages !== 'number') pages = 0;
  if(typeof curpage != 'number') curpage = 0;
  this.pages = pages;
  this.curpage = curpage;
  this.pagination = pagination;
}

$Pagination.prototype.init = function init() {
  let pre = this.curpage - 1;
  let next = this.curpage + 1;
  pre = pre < 1 ? 1: pre;
  next = next > this.pages ? this.pages : next;

  this.showPrev();
  this.showThreeDot(this.curpage - 3);
  this.show(this.curpage - 2);
  this.show(this.curpage - 1);
  this.showCurPage();
  this.show(this.curpage + 1);
  this.show(this.curpage + 2);
  this.showThreeDot(this.curpage + 3);
  this.showNext();
}

$Pagination.prototype.showThreeDot = function showThreeDot(page) {
  if(page < this.pages && page > 1)
    this.pagination.append('<li><a href="javascript:void(0)">...</a></li>');
}

$Pagination.prototype.show = function show(page) {
  if(page <= this.pages && page >= 1)
    this.pagination.append('<li><a href="?page=' + page + '">'+ page +'</a></li>');
}

$Pagination.prototype.showCurPage = function showCurPage() {
  this.pagination.append('<li><a class="active" href="?page=' + this.curpage + '">'+ this.curpage +'</a></li>');
}

$Pagination.prototype.showPrev = function showPrev() {
  let prev = this.curpage - 1;
  if(prev >= 1)
      this.pagination.append('<li><a href="?page=' + prev + '">«</a></li>');
  else
      this.pagination.append('<li class="disabled"><a href="javascript:void(0)">«</a></li>');
}

$Pagination.prototype.showNext = function showNext() {
  let next = this.curpage + 1;
  if(next <= this.pages)
      this.pagination.append('<li><a href="?page=' + next + '">»</a></li>');
  else
      this.pagination.append('<li class="disabled"><a href="javascript:void(0)">»</a></li>');
}
