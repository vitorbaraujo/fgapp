import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  WebView,
  Linking
} from 'react-native';

import Dimensions from 'Dimensions';
import { BASE_URL } from '../config/axios';

const width = parseInt(Dimensions.get('window').width);
const height = parseInt(Dimensions.get('window').height);

const imageWidth = parseInt(width * 0.8);
const imageHeight = parseInt(imageWidth / width);

export default class Article extends Component {

  constructor(props) {
    super(props);

    var date = new Date(this.props.date);

    this.state = {
      parsedBody: this.parseHtml(this.props.body),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    }
  }

  parseHtml(text="") {
    text = this.parseImageLink(text);
    text = this.parseIframeSrc(text);
    text = this.parseWidthValue(text);
    text = this.parseHeightValue(text);

    return this.parseCustomCss(text);
  }

  parseImageLink(text="") {
    const imageRegex = /(<img.+?src=")(.+?)(".+?>)/gim;
    let matchesArray = [];

    while((match = imageRegex.exec(text)) !== null){
      if(match[2].indexOf('http') !== 0){
        matchesArray.push(match[2]);
      }
    }

    for(var i in matchesArray){
      index = text.indexOf(matchesArray[i]);
      var temp = text.slice(0, index) + BASE_URL + text.slice(index);
      text = temp;
    }

    return text;
  }

  parseIframeSrc(text="") {
    const iframeRegex = /(<iframe.+?src=")(.+?)(".+?<\/iframe>)/gim;
    let matchesArray = [];

    while((match = iframeRegex.exec(text)) !== null){
      if(match[2].indexOf('http:') !== 0){
        matchesArray.push(match[2]);
      }
    }

    for(var i in matchesArray){
      index = text.indexOf(matchesArray[i]);
      var temp = text.slice(0, index) + 'http:' + text.slice(index);
      text = temp;
    }

    return text;
  }

  parseWidthValue(text) {
    let htmlWidthRegex = /width="[^"]*"/gim;
    return text.replace(htmlWidthRegex, 'width="' + imageWidth + '"');
  }

  parseHeightValue(text) {
    let htmlHeightRegex = /height="[^"]*"/gim;
    let originalHeight = parseInt(htmlHeightRegex);
    return text.replace(htmlHeightRegex, 'height="' + imageHeight * originalHeight + '"');
  }

  parseCustomCss(text) {
    let htmlStyleRegex = /style="[^"]*"/gim;
    return text.replace(htmlStyleRegex, "");
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{this.props.title}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{(this.state.day < 10 ? "0" : "") + this.state.day}/{(this.state.month < 10 ? "0" : "") + this.state.month}/{this.state.year} {this.props.authorName}</Text>
        </View>

        <View style={styles.bodyContainer}>
          <WebView
            source={{html: this.state.parsedBody}}
            ref={(ref) => { this.webview = ref }}
            onNavigationStateChange={(e) => {
              if(e.url != this.state.parsedBody) {
                Linking.canOpenURL(e.url).then(supportedLink => {
                  if(supportedLink) {
                    this.webview.stopLoading();
                    Linking.openURL(e.url);
                  }
                })
              }
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20
  },

  titleContainer: {
    flex: 7,
    justifyContent: "center"
  },

  title: {
    color: "#005263",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },

  dateContainer: {
    flex: 2,
  },

  date: {
    textAlign: "right"
  },

  bodyContainer: {
    flex: 17
  }
})
