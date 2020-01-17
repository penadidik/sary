/**
 * 공통 기본 메세지 스크립트
 *
 * @author 박소현
 * @version 1.0 2017/12/26
 */
var jprops = {};

jprops.calendar = {};
jprops.calendar.week0  = '일';
jprops.calendar.week1  = '월';
jprops.calendar.week2  = '화';
jprops.calendar.week3  = '수';
jprops.calendar.week4  = '목';
jprops.calendar.week5  = '금';
jprops.calendar.week6  = '토';
jprops.calendar.month  = '월';
jprops.calendar.prev   = '이전 달';
jprops.calendar.next   = '다음 달';
jprops.calendar.year   = '년';
jprops.calendar.time   = '시간';
jprops.calendar.hour   = '시';
jprops.calendar.minute = '분';
jprops.calendar.second = '초';
jprops.calendar.today  = '오늘';
jprops.calendar.close  = '완료';

jprops.validate = {};
jprops.validate.login = {};
jprops.validate.login.userid   = 'Please enter your id.';
//jprops.validate.login.pword = 'Please enter a pword.';
jprops.validate.login.format   = 'Invalid email format'; 
jprops.validate.login.check = 'Please check your user id or password again. <br> You are not registered, or you have incorrectly entered your user id or password.';


jprops.validate.blind = {};
jprops.validate.blind.check = 'Please select control blind.';

jprops.validate.join = {};

jprops.validate.join.input = '* 필수정보입니다.';

jprops.validate.join.userid   	= '* 아이디를 입력해주세요.';
jprops.validate.join.userid2   	= '* 이미 사용중이거나 탈퇴한 아이디입니다.';
jprops.validate.join.username   = '* 이름을 입력해주세요.';
jprops.validate.join.varify   	= '* 비밀번호를 확인해주세요.';
jprops.validate.join.device   	= '* 차량을 입력해주세요.';
jprops.validate.join.device2   	= '* 이미 등록된 차량입니다.'; 

jprops.validate.file = {};
jprops.validate.file.empty = 'Please check the file to be uploaded.';
jprops.validate.file.excel = 'Only "xls", "xlsx" file types can be uploaded.';

jprops.validate.empty = {};
jprops.validate.empty.item = 'Empty Item';

jprops.title = {};
jprops.title.confirm = 'Confirm';
jprops.title.message = 'Message';
jprops.title.error = 'Error';
jprops.title.close = 'Close';

jprops.contents = {};
jprops.contents.error = 'Error Code :';

jprops.btn = {};
jprops.btn.search      = '검색';
jprops.btn.create      = '생성';
jprops.btn.modify      = '수정';
jprops.btn.cancel      = '취소';
jprops.btn.close       = '';
jprops.btn.confirm     = 'OK';
jprops.btn.remove      = '삭제';
jprops.btn.append      = '추가';

jprops.success = {};
jprops.success.general  = 'Processing is complete.'; 
jprops.success.roomUpdate  = 'The Room informations has been successfully updated.'; 
jprops.success.roomDelete  = 'The Room informations has been successfully deleted.'; 
jprops.success.uploadConfiguration = 'Configuration file has been successfully uploaded.'; 

jprops.page = {};
jprops.page.login = '/tso-console';
jprops.page.dashboard = '/tso-console/dashboard';
jprops.page.statistichistory = '/tso-console/statistichistory';
jprops.page.statistichistoryfloor = '/tso-console/statistichistoryfloor';
jprops.page.statistichistoryall = '/tso-console/statistichistoryall';
jprops.page.management = '/tso-console/management';
jprops.page.managementDetail  = '/tso-console/management_detail';
jprops.page.configuration = '/tso-console/configuration';
jprops.page.controlhistory = '/tso-console/controlhistory';
jprops.page.administrator = '/tso-console/administrator';
jprops.page.roomcontrol = '/tso-console/roomcontrol';

jprops.page_title = {    
    dashboard: 'Dashboard',
    management: 'Management',
    management_detail: 'Mmanagement detail',
    configuration: 'Configuration',
    controlhistory: 'Control history',
    administrator: 'Administrator'
};

jprops.room = {};
jprops.room.roomId = 'ID';
jprops.room.roomNm = 'Name';
jprops.room.blindControl = 'Blind Control';
jprops.room.desc = 'Description';
jprops.room.gateway = 'Gateway';
jprops.room.ip = 'IP Address';
jprops.room.mac = 'MAC Address';
jprops.room.blindInfo = 'Blind Channels';
