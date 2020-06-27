import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native'
import { Audio } from 'expo-av'

export class AudioPlayer extends React.Component {
  state = {
    isPlaying: false,
    playbackInstance: null,
    currentIndex: 0,
    volume: 1.0,
    playbackStatus: null
  }
  
  get playlist() {
    return this.props.playlist
  }

  get currentTrack() {
    const { currentIndex, playbackInstance } = this.state
    return playbackInstance && this.playlist[currentIndex]
  }

  get isBuffering() {
    const { playbackStatus } = this.state
    return playbackStatus && playbackStatus.isBuffering
  }

  async componentDidMount() {
    console.log('Loading component', this.playlist)
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: true
      })

      this.loadAudioAtIndex(0)
    } catch (error) {
      this.handleError(error)
    }
  }

  async loadAudioAtIndex(index) {
    const { isPlaying, volume } = this.state

    try {
      const playbackInstance = new Audio.Sound()
      const source = {
        uri: this.playlist[index].uri
      }

      const status = {
        shouldPlay: isPlaying,
        volume: volume
      }

      playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
      await playbackInstance.loadAsync(source, status, false)
      return new Promise(resolve => this.setState({
        currentIndex: index,
        playbackInstance
      }, resolve));
    } catch (error) {
      this.handleError(error)
    }
  }

  onPlaybackStatusUpdate = status => {
    this.setState({
      playbackStatus: status
    })
  }
  
  handleError = error => {
    const { onError } = this.props
    onError ? onError(error) : console.error(error)
  }

  handlePlayPause = async () => {
    const { isPlaying, playbackInstance } = this.state
    isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()

    return new Promise(resolve => this.setState({
      isPlaying: !isPlaying
    }, resolve))
  }

  handlePreviousTrack = async () => {
    let { currentIndex } = this.state
    const prevIndex = currentIndex === 0 ? this.playlist.length -1 : currentIndex-1
    this.playTrackAtIndex(prevIndex)
  }

  handleNextTrack = async () => {
    let { currentIndex } = this.state
    const nextIndex = currentIndex+1 > this.playlist.length - 1 ? 0 : currentIndex+1
    this.playTrackAtIndex(nextIndex)
  }

  playTrackAtIndex = async (index) => {
    let { isPlaying, playbackInstance } = this.state
    if (playbackInstance) {
      await playbackInstance.stopAsync()
      await playbackInstance.unloadAsync()
      await this.loadAudioAtIndex(index)
      try {
        if (isPlaying) playbackInstance.playAsync()
      } catch(e) {}
    }
  }

  renderFileInfo() {
    const { playbackInstance } = this.state
    return playbackInstance ? (
      <View style={styles.trackInfo}>
        <Text style={[styles.trackInfoText, styles.largeText]}>
          {this.currentTrack.title}
        </Text>
        <Text style={[styles.trackInfoText, styles.smallText]}>
          {this.currentTrack.author}
        </Text>
        <Text style={[styles.trackInfoText, styles.smallText]}>
          {this.currentTrack.source}
        </Text>
      </View>
    ) : null
  }

  render() {
    if (this.props.renderPlayer) {
      return this.props.renderPlayer(this)
    }
    return (
      <View style={styles.container}>
        {
          (this.currentTrack && this.currentTrack.imageSource) && (
            <Image
              style={styles.albumCover}
              source={{ uri: this.currentTrack.imageSource }}
            />
          )
        }
        <View style={styles.controls}>
          <TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
            <Text>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
            {this.state.isPlaying ? (
              <Text>Pause</Text>
            ) : (
              <Text>Play</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
            <Text>Forward</Text>
          </TouchableOpacity>
        </View>
        {this.renderFileInfo()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  albumCover: {
    width: 250,
    height: 250
  },
  trackInfo: {
    padding: 40,
    backgroundColor: '#fff'
  },

  trackInfoText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    color: '#550088'
  },
  largeText: {
    fontSize: 22
  },
  smallText: {
    fontSize: 16
  },
  control: {
    margin: 20
  },
  controls: {
    flexDirection: 'row'
  }
})
