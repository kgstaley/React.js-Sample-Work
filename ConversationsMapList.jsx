import React from "react";
import PropTypes from "prop-types";
import * as styles from "./Chat.module.css";

const ConversationsMapList = ({ conversations, setCurrentConvoInfo }) => {
  const conversationsList = conversations.map(conversation => (
    <li
      key={conversation.conversationId}
      className={(styles.ConversationListItem, styles.a)}
      onClick={() => {
        setCurrentConvoInfo(
          conversation.conversationId,
          conversation.participantId,
          `${conversation.firstName} ${conversation.lastName}`,
          `${conversation.avatarUrl}`
        );
      }}
    >
      <a href="javascript:void(0)">
        <img
          src={conversation.avatarUrl}
          alt={conversation.firstName}
          className={`${styles.ConversationListAvatar} ml-3`}
        />{" "}
        <span>
          {conversation.firstName} {conversation.lastName}{" "}
        </span>
      </a>
    </li>
  ));
  return conversationsList;
};

ConversationsMapList.propTypes = {
  conversations: PropTypes.array.isRequired,
  setCurrentConvoInfo: PropTypes.func.isRequired
};

export default React.memo(ConversationsMapList);
