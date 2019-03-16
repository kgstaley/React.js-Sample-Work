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
        <div
          className="slimScrollBar"
          style={{
            background: "rgb(220, 220, 220)",
            width: "5px",
            position: "absolute",
            top: "0px",
            opacity: "0.4",
            display: "none",
            borderRadius: "7px",
            zIndex: "99",
            right: "1px",
            height: "660.054px"
          }}
        />
        <div
          className="slimScrollRail"
          style={{
            width: "5px",
            height: "100%",
            position: "absolute",
            top: "0px",
            display: "none",
            borderRadius: "7px",
            background: "rgb(51, 51, 51)",
            opacity: "0.2",
            zIndex: "90",
            right: "1px"
          }}
        />
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
