import React from "react";
import "../../assets/scss/style.css";
import "./ChatTheme.css";
import PropTypes from "prop-types";
import ConversationsMapList from "./ConversationsMapList";

class ConversationsList extends React.Component {
  handleConversationPush = (conversationId, recepientId) => {
    this.props.setRoutingPathConvoId(conversationId, recepientId);
  };

  render() {
    const { conversations } = this.props;
    return (
      <div
        className="slimScrollDiv"
        style={{
          position: "relative",
          overflow: "visible hidden",
          width: "auto",
          height: "100%"
        }}
      >
        <ul
          className="chatonline style-none "
          style={{ overflowY: "auto", width: "auto", height: "90%" }}
        >
          <ConversationsMapList
            conversations={conversations}
            setCurrentConvoInfo={this.props.setCurrentConvoInfo}
          />
        </ul>
      </div>
    );
  }
}

ConversationsList.propTypes = {
  conversations: PropTypes.array.isRequired,
  loadCurrentConvo: PropTypes.func,
  setRoutingPathConvoId: PropTypes.func,
  deleteConversationPrompt: PropTypes.func.isRequired,
  setCurrentConvoInfo: PropTypes.func.isRequired
};

export default ConversationsList;
