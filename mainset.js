// ---------------------------- 로그인 화면 기능 ----------------------------
// 로그인 시 실행되어야 하는 함수들이 정의 되어있다.
// 1. Email정보와 Password정보를 가져오는 기능.
// 2. 로그인 버튼 기능 활성화 및 비활성화 기능.
// 3. 로그인 실패 시 출력되는 에러 문구 활성화 및 비활성화 기능.
// ----------------------------------------------------------------------

// 로그인 시 입력한 이메일을 가져온다.
function getEmail(){
    return $("#kakao-email").val();
}

// 로그인 시 입력한 비밀번호를 가져온다.
function getPassword(){
    return $("#kakao-pw").val();
}

// 로그인이 가능하도록 변경한다.
function enableLogin(){
    $("#login-btn").addClass("enable-login");
    $("#login-btn").removeClass("disable-login");
}

// 로그인이 불가능하도록 변경한다.
function disableLogin(){
    $("#login-btn").removeClass("enable-login");
    $("#login-btn").addClass("disable-login");
}

// 로그인 에러 문구를 띄운다.
function showErrorLog(){
    $("#login-err").show();
}

// 로그인 에러 문구를 없앤다.
function hideErrorLog(){
    $("#login-err").hide();
}

// ---------------------------- 채팅 화면 기능 ----------------------------
// 로그인 이후 채팅 시 실행되어야 하는 함수들이 정의 되어있다.
// 1. 작성한 채팅 내용을 가져오는 기능.
// 2. 채팅 내용 전송 시 전송 버튼 활성화 및 비활성화 기능.
// 3. 채팅 전송 내용 말풍선 추가 기능.
// 4. 채팅 수신 내용 말풍선 추가 기능.
// 5. 새로운 채팅 입력 또는 수신 시 채팅 스크롤 하단부 이동 기능.
// 6. 최초 사용자 닉네임 설정 기능.
// 7. 사용자 닉네임 표시 기능.
// 8. 사용자 닉네임 수정 기능.
// 9. 현재 입장 인원 표시 기능.
// 10. 현재 사용자의 UID를 가져오는 기능.
// ---------------------------------------------------------------------

// 전송 버튼을 비활성화 시킨다.
function disableTextSend(){
    $("#text-send").addClass("disable-text-send");
    $("#text-send").removeClass("enable-text-send");
}

// 전송 버튼을 활성화 시킨다.
function enableTextSend(){
    $("#text-send").removeClass("disable-text-send");
    $("#text-send").addClass("enable-text-send");
}

// 채팅 내용을 가져온다.
function getInputChat(){
    return $("#input-chat").val();
}

// 나의 채팅 내용을 WEB에 보이도록 한다.
function makeMyChat(contents){
    $("#chat-contents-wrapper").append(
        "<div>"+
            "<div class='my-chat'>"+
                "<pre class='my-chat-contents'>"+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
    scrollBottom();
}

// 상대의 채팅 내용을 WEB에 보이도록 한다.
function makeOtherChat(nickName, contents){
    $("#chat-contents-wrapper").append(
        "<div>"+
            "<div class='other-chat'>"+
                "<pre class='other-nic'>"+nickName+"</pre>"+
                "<pre class='other-chat-contents'>"+contents+"</pre>"+
            "</div>"+
        "</div>"
    )
    scrollBottom();
}

// 채팅 스크롤을 가장 아래로 가게 한다.
function scrollBottom(){
    $("#chat-contents-wrapper").stop().animate({ scrollTop: $("#chat-contents-wrapper")[0].scrollHeight }, "slow");
}

// 현재 사용자의 닉네임을 얻어온다.
function getNickname(){
    return firebase.database().ref("users/"+getCurrentUid()+"/nickName");
}

// 수정 닉네임을 DB에 저장한다.
function updateNickname(nickName){
    return firebase.database().ref("users/"+getCurrentUid()).update({nickName: nickName});
}

// 닉네임 변경사항을 DB에 업로드한다.
function upLoadNickname(uid){
    return firebase.database().ref("users/" +getCurrentUid()).set({
        email: getEmail(),
        nickName : getEmail()
    });
}

// 수정된 닉네임을 WEB에 표시한다.
function setNicknameWeb(nickName){
    $("#user-nic").text(nickName)
}

// 입장 인원을 WEB에 보여준다.
function setOnlineNumber(onlineNum){
    $("#online-num").text(onlineNum);
}

// 현재 사용자의 Uid를 가져온다.
function getCurrentUid(){
    return firebase.auth().getUid();
}

// ------------------------ 로그인 -> 채팅 전환 기능 ------------------------
// 로그인 시 채팅화면으로 이동할 때 사용되는 함수들이 정의되어있다.
// 1. 로그인 화면이 보이지 않도록 하는 기능.
// 2. 채팅 화면이 보이도록 하는 기능.
// 3. 로그인 입력 정보를 초기화 하는 기능.
// 4. 로딩 화면을 띄우는 기능.
// 5. 로딩 화면을 제거하는 기능.
// ---------------------------------------------------------------------

// 로그인 화면이 사라지게 한다.
function hideKakaoLoginWrapper(){
    $("#kakao-wrapper").removeClass("show-kakao-wrapper");
    $("#kakao-wrapper").addClass("hide-kakao-wrapper");
}

// 로그인 화면이 나타나게 한다.
function showKakaoLoginWrapper(){
    $("#kakao-wrapper").removeClass("hide-kakao-wrapper");
    $("#kakao-wrapper").addClass("show-kakao-wrapper");
}


// 로그인 화면 입력 값을 초기화한다.
function resetLogin(){
    $("#kakao-email").val("");
    $("#kakao-pw").val("");
}

// 로딩창을 띄운다.
function showLoading(){
    $("#spinner-warpper").show();
}

// 로딩창을 없앤다.
function hideLoading(){
    $("#spinner-warpper").hide();
}

// ------------------------ 채팅 -> 로그인 전환 기능 ------------------------
// 로그아웃 시 로그인화면으로 이동할 때 사용되는 함수들이 정의되어있다.
// 1. 채팅 화면이 보이지 않도록 하는 기능.
// 2. 로그인 화면이 보이도록 하는 기능.
// 3. 기존 채팅 데이터를 제거하는 기능.
// ---------------------------------------------------------------------

// 채팅화면이 사라지게 한다.
function hideChatWrapper(){
    $("#kakao-chat-wrapper").removeClass("show-kakao-chat-wrapper");
    $("#kakao-chat-wrapper").addClass("hide-kakao-chat-wrapper");
}

// 채팅화면이 나타나게 한다.
function showChatWrapper(){
    $("#kakao-chat-wrapper").removeClass("hide-kakao-chat-wrapper");
    $("#kakao-chat-wrapper").addClass("show-kakao-chat-wrapper");
}

// 로그아웃 시 기존 채팅 데이터를 제거한다.
function removeChatData(){
    $("#chat-contents-wrapper").children().remove();
}