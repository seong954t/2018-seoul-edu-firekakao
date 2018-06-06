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

// 로그인 시 입력한 이메일을 가져온다.
function getEmail(){
    return $("#kakao-email").val();
}

// 로그인 시 입력한 비밀번호를 가져온다.
function getPassword(){
    return $("#kakao-pw").val();
}

// 채팅 내용을 가져온다.
function getInputChat(){
    return $("#input-chat").val();
}

// 현재 사용자의 Uid를 가져온다.
function getCurrentUid(){
    return firebase.auth().getUid();
}

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

// 로그인 에러 문구를 띄운다.
function showErrorLog(){
    $("#login-err").show();
}

// 로그인 에러 문구를 없앤다.
function hideErrorLog(){
    $("#login-err").hide();
}

// 로그아웃 시 기존 채팅 데이터를 제거한다.
function removeChatData(){
    $("#chat-contents-wrapper").children().remove();
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

// 수정된 닉네임을 WEB에 표시한다.
function setNicknameWeb(nickName){
    $("#user-nic").text(nickName)
}

// 입장 인원을 WEB에 보여준다.
function setOnlineNumber(onlineNum){
    $("#online-num").text(onlineNum);
}

// 채팅 스크롤을 가장 아래로 가게 한다.
function scrollBottom(){
    $("#chat-contents-wrapper").stop().animate({ scrollTop: $("#chat-contents-wrapper")[0].scrollHeight }, "slow");
}

// 수정 닉네임을 DB에 저장한다.
function updateNickname(nickName){
    return firebase.database().ref("users/"+getCurrentUid()).update({nickName: nickName});
}

// 현재 사용자의 닉네임을 얻어온다.
function getNickname(){
    return firebase.database().ref("users/"+getCurrentUid()+"/nickName");
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

// 닉네임 변경사항을 DB에 업로드한다.
function upLoadNickname(uid){
    return firebase.database().ref("users/" +getCurrentUid()).set({
        email: getEmail(),
        nickName : getEmail()
    });
}