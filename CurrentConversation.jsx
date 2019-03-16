import React from "react";
import "../../assets/scss/style.css";
import "./ChatTheme.css";
import ProductPreview from "./urlPreview/ProductPreview";
import InfluencerPreview from "./urlPreview/InfluencerPreview";
import ChatLinkPreview from "./urlPreview/ChatLinkPreview";
import PropTypes from "prop-types";
import MapCurrentConversation from "./MapCurrentConversation";

class CurrentConversation extends React.Component {
  componentDidMount = () => {
    this.scrollToBottom();
  };

  componentDidUpdate = () => {
    this.scrollToBottom();
  };

  scrollToBottom = () => {
    this.el.scrollIntoView({
      block: "end"
    });
  };

  //#region chat preview functions
  isProdUrl = message => {
    const url = message.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\/addToCart\/\d+\/\d+/g
    );
    return url;
  };

  isInfluencerUrl = message => {
    const url = message.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\/influencers\/userId\W\d+\S/g
    );
    return url;
  };

  isOtherUrl = message => {
    const otherUrl = message.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g
    );
    return otherUrl;
  };

  isWebUrl = message => {
    const webUrl = message.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g
    );
    return webUrl;
  };

  getPreview = message => {
    let content = null;
    const productUrlArr = this.isProdUrl(message);
    const influencerUrlArr = this.isInfluencerUrl(message);
    const newMessage = this.addAnchor(message);

    if (productUrlArr || influencerUrlArr) {
      content = (
        <React.Fragment>
          <ProductPreview message={newMessage} url={productUrlArr} />
          {productUrlArr ? (
            <InfluencerPreview url={influencerUrlArr} />
          ) : (
            <InfluencerPreview message={newMessage} url={influencerUrlArr} />
          )}
        </React.Fragment>
      );
    } else if (!productUrlArr && !influencerUrlArr) {
      content = (
        <InfluencerPreview message={newMessage} url={influencerUrlArr} />
      );
    } else {
      content = message;
    }

    return content;
  };

  addAnchor = message => {
    let newMessage = message
      .replace(
        /(?:^|[^"'])((ftp|http|https|file:):(\/\/[\S]+(\b|$)))/gim,
        '<a href="http://$3" class="one" target="_blank">$&</a>'
      )

      .replace(
        /(www.[^ <]+(\b|$))/gim,
        '<a href="http://$1" class="two" target="_blank">$1</a>'
      );

    return newMessage;
  };

  showWebUrlPreview = message => {
    const webUrl = this.isWebUrl(message);
    const webMessage = this.addAnchor(message, webUrl, 0, -1);
    return <ChatLinkPreview message={webMessage} url={webUrl} />;
  };

  replaceMulti = (string, replace, replacer) => {
    return string.split(replace).join(replacer);
  };

  //#endregion

  render() {
    const { conversation, currentUserId } = this.props;
    return (
      <ul
        className="chat-list p-20"
        style={{ overflowY: "auto", width: "auto", height: "401px" }}
      >
        <MapCurrentConversation
          conversation={conversation}
          currentUserId={currentUserId}
          getPreview={this.getPreview}
        />
        <div
          ref={el => {
            this.el = el;
          }}
        />
      </ul>
    );
  }
}

CurrentConversation.propTypes = {
  conversation: PropTypes.array,
  currentUserId: PropTypes.number
};

export default CurrentConversation;
