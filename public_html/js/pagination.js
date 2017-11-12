/**
 * @author Thanh An
 * @date 15/11/2016
 * @edit 12/11/2017
 **/

function $Pagination(pagination, pages, curpage, tag = 'page', sufix = '') {
    if (typeof pages !== 'number') pages = 0;
    if (typeof curpage != 'number') curpage = 1;
    if (curpage <= 0) curpage = 1;
    this.pages = pages;
    this.curpage = curpage;
    this.pagination = pagination;
    this.tag = tag;
    this.sufix = sufix;
    this.mark = [];
    this.addPag(1);
    this.addPag(2);
    this.addPag(3);
    this.addPag(curpage - 2);
    this.addPag(curpage - 1);
    this.addPag(curpage);
    this.addPag(curpage + 1);
    this.addPag(curpage + 2);
    this.addPag(pages - 2);
    this.addPag(pages - 1);
    this.addPag(pages);
    for (let i = 0; i < this.mark.length - 1; i++) {
        if (this.mark[i] < this.mark[i + 1] - 1) {
            this.mark.splice(i + 1, 0, -1);
            i++;
        }
    }
}

$Pagination.prototype.addPag = function(p) {
    if (p > 0 && p <= this.pages && this.mark.indexOf(p) == -1)
        this.mark.push(p);
};

$Pagination.prototype.init = function init() {
    this.showPrev();
    this.mark.forEach((i) => {
        if (i === -1)
            this.showThreeDot();
        else
            this.show(i);
    });
    this.showNext();
}

$Pagination.prototype.showThreeDot = function showThreeDot() {
    this.pagination.append('<li><a href="javascript:void(0)">...</a></li>');
}

$Pagination.prototype.show = function show(page) {
    if (page <= this.pages && page >= 1)
        this.pagination.append('<li' + (page === this.curpage ? ' class="active"' : '') + '><a href="?' + this.tag + '=' + page + this.sufix + '">' + page + '</a></li>');
}

$Pagination.prototype.showPrev = function showPrev() {
    var prev = this.curpage - 1;
    if (prev >= 1)
        this.pagination.append('<li><a href="?' + this.tag + '=' + prev + this.sufix + '">«</a></li>');
    else
        this.pagination.append('<li class="disabled"><a href="javascript:void(0)">«</a></li>');
}

$Pagination.prototype.showNext = function showNext() {
    var next = this.curpage + 1;
    if (next <= this.pages)
        this.pagination.append('<li><a href="?' + this.tag + '=' + next + this.sufix + '">»</a></li>');
    else
        this.pagination.append('<li class="disabled"><a href="javascript:void(0)">»</a></li>');
}
