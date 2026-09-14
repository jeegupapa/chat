const rooms = [
  { id: "general", name: "#general", subtitle: "전체 공지와 알림" },
  { id: "design", name: "#design", subtitle: "디자인 협업" },
  { id: "dev", name: "#dev", subtitle: "개발 진행 상황" },
];

const messageTemplates = {
  general: [
    {
      author: "김하늘",
      time: "09:12",
      content: "오늘 오전 11시에 전사 스탠드업이 있습니다.",
    },
    {
      author: "박도윤",
      time: "09:30",
      content: "회의 자료는 위키에 업데이트했습니다.",
    },
  ],
  design: [
    {
      author: "이서연",
      time: "10:05",
      content: "모바일 플로우 시안 공유드립니다.",
    },
  ],
  dev: [
    {
      author: "최민준",
      time: "08:45",
      content: "API 응답 스키마 업데이트 완료했습니다.",
    },
  ],
};

const roomList = document.getElementById("room-list");
const roomTitle = document.getElementById("room-title");
const roomSubtitle = document.getElementById("room-subtitle");
const messageList = document.getElementById("message-list");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const usernameInput = document.getElementById("username");
const addRoomButton = document.getElementById("add-room");

let activeRoomId = rooms[0].id;

const storedData = JSON.parse(localStorage.getItem("chat-data") || "{}");

const state = {
  username: storedData.username || "",
  messages: storedData.messages || {},
  rooms: storedData.rooms || rooms,
};

usernameInput.value = state.username;

function saveState() {
  localStorage.setItem(
    "chat-data",
    JSON.stringify({
      username: state.username,
      messages: state.messages,
      rooms: state.rooms,
    })
  );
}

function formatMessage(message) {
  const container = document.createElement("article");
  container.className = "message";

  const header = document.createElement("div");
  header.className = "message-header";

  const author = document.createElement("span");
  author.textContent = message.author;

  const time = document.createElement("span");
  time.textContent = message.time;

  const content = document.createElement("p");
  content.className = "message-content";
  content.textContent = message.content;

  header.append(author, time);
  container.append(header, content);

  return container;
}

function renderRooms() {
  roomList.innerHTML = "";

  state.rooms.forEach((room) => {
    const li = document.createElement("li");
    li.textContent = room.name;
    li.dataset.roomId = room.id;

    const count = document.createElement("span");
    const totalMessages = (state.messages[room.id] || []).length;
    count.textContent = totalMessages;

    li.appendChild(count);

    if (room.id === activeRoomId) {
      li.classList.add("active");
    }

    li.addEventListener("click", () => {
      activeRoomId = room.id;
      renderRooms();
      renderChat();
    });

    roomList.appendChild(li);
  });
}

function renderChat() {
  const currentRoom = state.rooms.find((room) => room.id === activeRoomId);
  roomTitle.textContent = currentRoom.name;
  roomSubtitle.textContent = currentRoom.subtitle;

  messageList.innerHTML = "";

  const messages = state.messages[activeRoomId];

  if (!messages || messages.length === 0) {
    const starter = messageTemplates[activeRoomId] || [];
    state.messages[activeRoomId] = starter;
  }

  state.messages[activeRoomId].forEach((message) => {
    messageList.appendChild(formatMessage(message));
  });
}

function addMessage(content) {
  const now = new Date();
  const time = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = {
    author: state.username || "익명",
    time,
    content,
  };

  state.messages[activeRoomId] = state.messages[activeRoomId] || [];
  state.messages[activeRoomId].push(message);
  messageList.appendChild(formatMessage(message));
  messageList.scrollTop = messageList.scrollHeight;
  renderRooms();
  saveState();
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const content = messageInput.value.trim();
  if (!content) {
    return;
  }
  addMessage(content);
  messageInput.value = "";
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});

usernameInput.addEventListener("input", (event) => {
  state.username = event.target.value.trim();
  saveState();
});

addRoomButton.addEventListener("click", () => {
  const name = prompt("새 채팅방 이름을 입력하세요.");
  if (!name) {
    return;
  }

  const id = name.toLowerCase().replace(/\s+/g, "-");
  if (state.rooms.some((room) => room.id === id)) {
    alert("이미 같은 이름의 방이 있습니다.");
    return;
  }

  const newRoom = {
    id,
    name: name.startsWith("#") ? name : `#${name}`,
    subtitle: "새로운 대화방",
  };

  state.rooms.push(newRoom);
  state.messages[id] = [];
  activeRoomId = id;
  saveState();
  renderRooms();
  renderChat();
});

renderRooms();
renderChat();
