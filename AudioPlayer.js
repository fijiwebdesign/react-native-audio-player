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
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: true,
        ...this.props.audioMode
      })

      this.loadAudioAtIndex(0)
    } catch (error) {
      this.handleError(error)
    }
  }

  async loadAudioAtIndex(index) {
    const { isPlaying, volume } = this.state
    const track = this.playlist[index]

    try {
      const playbackInstance = new Audio.Sound()
      const source = track.media // { uri } | require()

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
    const { onPlaybackStatusUpdate } = this.props
    const { isPlaying } = this.state
    if (status) {
      this.setState({ playbackStatus: status })
      if (status.didJustFinish && isPlaying) {
        this.setState({ isPlaying: false })
      }
      onPlaybackStatusUpdate && onPlaybackStatusUpdate(status)
    }
  }

  play = async () => {
    const { playbackInstance } = this.state
    return playbackInstance && await playbackInstance.playAsync()
  }

  pause = async () => {
    const { playbackInstance } = this.state
    return playbackInstance && await playbackInstance.pauseAsync()
  }

  stop = async () => {
    const { playbackInstance } = this.state
    return playbackInstance && await playbackInstance.stopAsync()
  }
  
  handleError = error => {
    const { onError } = this.props
    onError ? onError(error) : console.error(error)
  }

  handlePlayPause = async () => {
    const { isPlaying } = this.state
    !isPlaying 
      ? await this.play()
      : await this.pause()

    return new Promise(resolve => this.setState({
      isPlaying: !isPlaying
    }, resolve))
  }

  handlePreviousTrack = async () => {
    let { currentIndex } = this.state
    const prevIndex = currentIndex === 0 ? this.playlist.length -1 : currentIndex-1
    return this.moveToTrackAtIndex(prevIndex)
  }

  handleNextTrack = async () => {
    let { currentIndex } = this.state
    const nextIndex = currentIndex+1 > this.playlist.length - 1 ? 0 : currentIndex+1
    return this.moveToTrackAtIndex(nextIndex)
  }

  moveToTrackAtIndex = async (index) => {
    let { isPlaying, playbackInstance } = this.state
    if (playbackInstance) {
      isPlaying && await this.stop()
      await playbackInstance.unloadAsync()
      return this.loadAudioAtIndex(index)
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
