// JScript File
var paramSave;
$(document).ready(function() {
	$('.bat-close').click( function(){
			$('#box_alert').hide();
	})
});


var dayslimit = 0;
var hourslimit = 0;
var minutelimit = 0;
var secondlimit = 0;
var _setTimeout;

function timeDisplay(txtTimeDislay, days, hours, minute, second, delay, btSave) 
{  
    dayslimit = days;
    hourslimit = hours;
    minutelimit = minute;
    secondlimit  = second;
     if(days == 0 & hours == 0 & minute == delay & second ==0 )
   {
		$('#bat_text').html('Còn <span class="cl bold"">'  + delay + '</span> phút nữa sẽ hết thời gian làm bài. Hãy kiểm tra lại bài làm và ấn nộp bài để hoàn thiện bài thi'); 
		$('#box_alert').fadeIn(1000);
		
		$('#box_alert').delay(5000).fadeOut(1000);		
	}
    var i=0;
    if(btSave)
    {
        paramSave=btSave;
    }


    if (second >= 0) {
        second = second - 1;
    }
    else {
        clearTimeout(_setTimeout);
        return false; 
    }
       
    if (second < 0){  
        second = 59; minute = minute-1;  
        if (minute < 0){  
            minute = 59; hours=hours-1;  
            if (hours < 0){
                hours = 23;  days=days-1;                
                }
        } 
    }

    if (days >= 0) {
        var hoursStr = ((hours < 10) ? '0' : '') + hours;
        var minuteStr = ((minute < 10) ? '0' : '') + minute;
        var secondStr = ((second < 10) ? '0' : '') + second;

        //        document.getElementById(txtTimeDislay).innerHTML = 'Còn '+days+' ngày '+hoursStr + ':' + minuteStr + ':' + secondStr; 
        document.getElementById(txtTimeDislay).innerHTML = '' + hoursStr + ':' + minuteStr + ':' + secondStr;

       _setTimeout = setTimeout('timeDisplay(\'' + txtTimeDislay + '\',' + days + ',' + hoursStr + ',' + minuteStr + ',' + secondStr + ',' + delay + ')', 1000);
    }
    else {
        document.getElementById(txtTimeDislay).innerHTML = 'Đã hết thời gian';
        //document.getElementById(paramSave).attr("disabled", "disabled");
        document.getElementById(paramSave).click();

    }
}

function timelimit(_minutelimit) {
    if(dayslimit == 0 & hourslimit == 0 & minutelimit <= _minutelimit )
    {
        return true;
    }
    else
    {
        alert("Thời gian nộp bài tối thiểu 30 phút. Hãy xem lại bài thi! Chúc bạn thi tốt!");
                $('#lnk_focus').focus();
                return false;
    }
    
} 

function timeCountdown(txtTimeDislay, days, hours, minute, second) 
{  
    second = second - 1;  
    if (second < 0){  
        second = 59; minute = minute-1;  
        if (minute < 0){  
            minute = 59; hours=hours-1;  
            if (hours < 0){
                hours = 23;  days=days-1;                
                }
        } 
    }  
    
    if (days>=0){
        var hoursStr = ((hours < 10) ? '0' : '') + hours;  
        var minuteStr = ((minute < 10) ? '0' : '') + minute;  
        var secondStr = ((second < 10) ? '' : '') + second;  
        
        document.getElementById(txtTimeDislay).innerHTML = 'Xin chờ ' + secondStr + ' giây'; 
                  
        setTimeout('timeCountdown(\'' + txtTimeDislay + '\','+ days+','+hoursStr +','+ minuteStr +','+ secondStr +')', 1000);
    }
    else if (days == -1) {
        document.getElementById(txtTimeDislay).innerHTML = '' + hoursStr + ':' + minuteStr + ':' + secondStr;
    }
    else{
        document.getElementById(txtTimeDislay).innerHTML = 'Xin chờ 0 giây'; 
    }
} 
