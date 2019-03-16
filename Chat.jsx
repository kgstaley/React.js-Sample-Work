import React from "react";
import { Button } from "reactstrap";
import { HubConnectionBuilder, LogLevel } from "@aspnet/signalr";
import ConversationsList from "./ConversationsList";
import MessageInput from "./MessageInput";
import CurrentConversation from "./CurrentConversation";
import CurrentConversationInfo from "./CurrentConversationInfo";
import SearchUsersToAdd from "./SearchUsersToAdd";
import "../../assets/scss/style.css";
import "./ChatTheme.css";
import * as styles from "./Chat.module.css";
import { API_HOST_PREFIX } from "../../services/serviceHelpers";
import SweetAlertWarning from "../ui/SweetAlertWarning";
import PropTypes from "prop-types";
import * as messageBoardService from "../../services/messageBoardService";
import logger from "../../logger";

const _logger = logger.extend("Chat");

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: "",
      connection: {},
      conversation: [],
      conversationId: null,
      conversations: [],
      conversationExists: false,
      currentConvoAvatar: "",
      currentConvoName: "",
      currentUserId: null,
      deleteConversation: false,
      deleteConfirm: false,
      modal: false,
      recepientId: 0,
      search: "",
      searchResults: []
    };
  }

  componentDidMount = () => {
    this.hubBuilder();
  };

  hubBuilder = () => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_HOST_PREFIX}/chathub`)
      .configureLogging(LogLevel.Information)
      .build();
    this.setState({ connection }, () => {
      this.state.connection
        .start()
        .then(this.onHubConnectionSuccess)
        .catch(this.onHubConnectionFail);
    });
    connection.on("ReturnCurrentUserId", this.onReturnCurrentUserIdSuccess);
    connection.on("ReceiveMessage", this.onReceiveSuccess);
    connection.on("NewConversation", this.onAddConvoSuccess);
    connection.on("LoadConversations", this.onLoadConvoListSuccess);
    connection.on("GetCurrentConversation", this.onGetCurrentConvoSuccess);
    connection.on("ReturnUserProfiles", this.onSearchUserSuccess);
    connection.on(
      "DeleteSelectedConversation",
      this.onDeleteConversationSuccess
    );
  };

  loadMsgList = () => {
    const { connection } = this.state;
    connection.invoke("GetConversationList").catch(this.onLoadConvoListFail);
    connection.invoke("GetCurrentUserId").catch(this.onGetCurrentUserIdFail);
  };

  setSelectedConvoHighlight = selectedConversationHighlight => {
    if (selectedConversationHighlight) {
      this.setState({ selectedConversationHighlight });
    }
  };

  setRoutingPathConvoId = (conversationId, recepientId) => {
    let newPath = null;
    if (conversationId) {
      newPath = `/chat?conversationId=${conversationId}&recepientId=${recepientId}`;
    } else {
      newPath = `/chat/`;
    }
    this.props.history.push(newPath, { conversationId });
  };

  loadCurrentConvo = (conversationId, recepientId) => {
    const { connection } = this.state;
    this.setState({ conversationId, recepientId });
    connection
      .invoke("LoadCurrentConversation", conversationId)
      .catch(this.onLoadCurrentConvoFail);
  };

  deleteConversationConfirm = deleteConfirm => {
    const { conversationId } = this.state;
    this.setState({ deleteConfirm });
    this.deleteConversation(conversationId);
  };

  deleteConversation = conversationId => {
    const { connection } = this.state;
    connection
      .invoke("DeleteConversationsAndMessages", conversationId)
      .catch(this.onDeleteConversationFail);
  };

  //#region prop functions

  onSubmit = () => {
    const { connection, conversationId, recepientId, body } = this.state;
    const payload = {
      conversationId: conversationId,
      body: body,
      recepientId: recepientId
    };
    connection
      .invoke("SendMessage", payload)
      .catch(this.onSendFail)
      .then(this.resetForm());
  };

  handleSubmitKeyPress = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.charCode === 13) {
      this.onSubmit();
    }
  };

  searchForUsersToAdd = () => {
    const { search, connection } = this.state;
    if (search) {
      connection
        .invoke("SearchUserProfilesToAdd", search)
        .catch(this.onSearchUserFail);
    }
  };

  handleSearchKeyPress = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.charCode === 13) {
      this.searchForUsersToAdd();
    }
  };

  resetForm = () => {
    this.playEnterSound();
    this.setState({ body: "" });
  };

  resetSearch = () => {
    this.setState({ search: "" });
  };

  setRecepientUserId = recepientId => {
    this.setState({ recepientId });
  };

  handleChange = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    const key = evt.target.name;
    const val = evt.target.value;
    this.setState({
      [key]: val
    });
  };

  createNewChat = evt => {
    const { recepientId, connection, conversations } = this.state;
    evt.preventDefault();
    evt.stopPropagation();
    if (conversations) {
      const activeConversations = conversations.find(
        conversation => conversation.participantId === recepientId
      );

      if (!activeConversations) {
        connection
          .invoke("AddConversation", recepientId)
          .catch(this.onAddConvoFail);
        this.setState({ modal: false });
      } else {
        this.setState({ conversationExists: true });
      }
    } else {
      connection
        .invoke("AddConversation", recepientId)
        .catch(this.onAddConvoFail);
      this.setState({ modal: false });
    }
  };

  setCurrentConvoInfo = (
    conversationId,
    recepientId,
    currentConvoName,
    currentConvoAvatar
  ) => {
    this.setState({ currentConvoName, currentConvoAvatar });
    this.loadCurrentConvo(conversationId, recepientId);
    this.setRoutingPathConvoId(conversationId, recepientId);
  };

  deleteConversationPrompt = (conversationId, deleteConversation) => {
    this.setState({ deleteConversation, conversationId });
  };

  cancelDelete = () => {
    this.setState({ deleteConversation: false, deleteConfirm: false });
  };

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal,
      search: "",
      searchResults: null,
      recepientId: null,
      conversationId: null,
      conversationExists: false
    }));
  };

  //#endregion

  //#region onSuccess & onFail functions

  onHubConnectionSuccess = () => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let query = Number(params.get("conversationId"));
    let query2 = Number(params.get("recepientId"));
    _logger(query2);
    if (query === null) {
      this.loadMsgList();
    } else {
      this.loadCurrentConvo(query, query2);
      this.loadMsgList();
      messageBoardService
        .getParticipantInfo(query2)
        .then(this.getParticipantInfoSuccess)
        .catch(this.getParticipantInfoError);
    }
  };

  onAddConvoSuccess = res => {
    _logger("hello from chat", res);
    const { connection, conversations } = this.state;
    if (conversations) {
      this.setState(prevState => {
        const newArr = [...prevState.conversations, res];
        return { conversations: newArr };
      });
    } else {
      this.setState({
        conversations: [res]
      });
    }
    this.setState({
      conversationId: res.conversationId,
      currentConvoName: `${res.firstName} ${res.lastName}`,
      currentConvoAvatar: res.avatarUrl
    });
    this.props.history.push(
      `/chat?conversationId=${res.conversationId}&recepientId=${
        res.participantId
      }`
    );
    connection.invoke("LoadCurrentConversation", res.conversationId);
  };

  onAddConvoFail = err => {
    _logger(`Failed to create a new conversation.`, err);
  };

  onReceiveSuccess = res => {
    const { conversation } = this.state;
    if (conversation) {
      this.setState(prevState => {
        let newArr = [...prevState.conversation, res];
        return { conversation: newArr };
      });
    } else {
      this.setState({ conversation: [res] });
    }
  };

  playEnterSound = () => this.audioEnter.play();

  onReceiveUserSuccess = res => {
    const { conversation } = this.state;
    _logger("hello");
    if (conversation) {
      this.setState(prevState => {
        let newArr = [...prevState.conversation, res];
        return { conversation: newArr };
      });
    } else {
      this.setState({ conversation: [res] });
    }
  };

  onSendFail = err => {
    _logger(`Failed to send msg.`, err);
  };

  onFailGetConversationById = err => {
    _logger("failed", err);
  };

  getParticipantInfoSuccess = success => {
    if (success.item.firstName === null) {
      this.setState({
        currentConvoName: ""
      });
    } else {
      this.setState({
        currentConvoAvatar: success.item.avatarUrl,
        currentConvoName: `${success.item.firstName} ${success.item.lastName}`
      });
    }
  };

  getParticipantInfoError = err => {
    _logger(err);
  };

  onHubConnectionFail = err => {
    _logger(`HubConnection Fail`, err);
  };

  onReturnCurrentUserIdSuccess = data => {
    this.setState({ currentUserId: data });
  };

  onLoadConvoListSuccess = data => {
    this.setState({ conversations: data });
  };

  onLoadConvoListFail = err => {
    _logger(`Failed to load conversations list.`, err);
  };

  onGetCurrentConvoSuccess = data => {
    this.setState({ conversation: data });
    this.setSelectedConvoHighlight(true);
  };

  onLoadCurrentConvoFail = err => {
    _logger(`Failed to load convo by id.`, err);
  };

  onSearchUserSuccess = res => {
    this.setState({ searchResults: res });
  };

  onSearchUserFail = err => {
    _logger(`Failed to search for user.`, err);
  };

  onDeleteConversationSuccess = () => {
    this.setState(
      {
        conversationId: "",
        deleteConversation: false,
        deleteConfirm: false,
        conversation: [],
        currentConvoName: "",
        currentConvoAvatar: ""
      },
      this.props.history.push(`/chat`),
      this.loadMsgList()
    );
  };

  onDeleteConversationFail = err => {
    _logger(`Failed to delete selected conversation.`, err);
  };
  //#endregion

  render() {
    const {
      body,
      conversation,
      conversations,
      conversationId,
      conversationExists,
      currentConvoAvatar,
      currentConvoName,
      currentUserId,
      deleteConversation,
      deleteConfirm,
      modal,
      search,
      searchResults,
      recepientId
    } = this.state;
    return (
      <div>
        <div className="col-xs-12 col-lg-10 offset-lg-1">
          <div className="card m-b-0">
            <div className="text-center mt-3 b-b">
              <h2>Messages</h2>
            </div>
            <div className="chat-main-box">
              <div className="chat-left-aside">
                <div className="open-panel">
                  <i className="ti-angle-right" />
                </div>
                <div
                  className="chat-left-inner"
                  style={{ height: "579px", overflow: "visible" }}
                >
                  <div className="form-material text-center mt-3 pb-3 b-b">
                    <SearchUsersToAdd
                      createNewChat={this.createNewChat}
                      handleChange={this.handleChange}
                      handleSearchKeyPress={this.handleSearchKeyPress}
                      modal={modal}
                      search={search}
                      searchForUsersToAdd={this.searchForUsersToAdd}
                      searchResults={searchResults}
                      setRecepientUserId={this.setRecepientUserId}
                      recepientId={recepientId}
                      toggle={this.toggle}
                    />

                    <button
                      className="btn btn-outline-dark mx-0"
                      type="text"
                      onClick={this.toggle}
                    >
                      Search Contacts
                    </button>
                  </div>

                  <ConversationsList
                    conversations={conversations}
                    deleteConversationPrompt={this.deleteConversationPrompt}
                    setCurrentConvoInfo={this.setCurrentConvoInfo}
                  />
                </div>
              </div>
              <div className="chat-right-aside">
                <div className="chat-main-header row">
                  <div className="col p-20 ml-3 w-50">
                    <CurrentConversationInfo
                      className={styles.CurrentConversationInfo}
                      currentConvoName={currentConvoName}
                      currentConvoAvatar={currentConvoAvatar}
                    />

                    <audio ref={r => (this.audioEnter = r)}>
                      <source
                        src="http://gauss.ececs.uc.edu/Courses/c653/lectures/AIM/sound/imsend.wav"
                        type="audio/mpeg"
                      />
                    </audio>

                    <Button
                      type="button"
                      className={styles.DeleteBtn}
                      size="sm"
                      color="danger"
                      onClick={() =>
                        this.deleteConversationPrompt(conversationId, true)
                      }
                    >
                      Delete Chat
                    </Button>
                  </div>
                </div>
                <div
                  className="chat-rbox b-t m-t-5"
                  style={{ overflow: "visible" }}
                >
                  <div className={styles.slimScrollDiv}>
                    <audio ref={r => (this.audioEnter = r)}>
                      <source
                        src="http://gauss.ececs.uc.edu/Courses/c653/lectures/AIM/sound/imsend.wav"
                        type="audio/mpeg"
                      />
                    </audio>
                    <CurrentConversation
                      key={this.props.match.params.conversationId}
                      conversation={conversation}
                      currentUserId={currentUserId}
                    />
                    <div className={styles.slimScrollBar} />
                    <div className={styles.slimScrollRail} />
                  </div>
                </div>
                <div className="card-body b-t">
                  <div className="row">
                    <div className="col-12 pt-2">
                      <MessageInput
                        body={body}
                        handleChange={this.handleChange}
                        handleSubmitKeyPress={this.handleSubmitKeyPress}
                        onSubmit={this.onSubmit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              Got questions? Email us at questions@myApp.com
            </div>
            {deleteConversation && (
              <SweetAlertWarning
                confirmAction={() => this.deleteConversationConfirm(true)}
                cancelAction={this.cancelDelete}
                type="warning"
              />
            )}
            {deleteConfirm && (
              <SweetAlertWarning
                title="Delete Successful"
                message=""
                type="success"
                confirmAction={this.onDeleteConversationSuccess}
              />
            )}
            {conversationExists && (
              <SweetAlertWarning
                title="You already have a chat with this person!"
                message=""
                type="success"
                confirmAction={this.toggle}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

Chat.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
};

export default Chat;
