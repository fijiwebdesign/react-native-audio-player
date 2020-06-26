import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'

export default class MusicPlayer extends React.Component {
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
				playThroughEarpieceAndroid: true
			})

			this.loadAudioAtIndex(0)
		} catch (error) {
      this.handlerrorError(e)
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
			this.setState({
        currentIndex: index,
				playbackInstance
			})
		} catch (error) {
      this.handlerrorError(e)
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

		this.setState({
			isPlaying: !isPlaying
		})
	}

	handlePreviousTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
      await playbackInstance.stopAsync()
			await playbackInstance.unloadAsync()
			this.loadAudioAtIndex(currentIndex === 0 ? this.playlist.length -1 : currentIndex-1)
		}
	}

	handleNextTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
      await playbackInstance.stopAsync()
			await playbackInstance.unloadAsync()
			this.loadAudioAtIndex(currentIndex+1 > this.playlist.length - 1 ? 0 : currentIndex+1)
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
				<Image
					style={styles.albumCover}
					source={{ uri: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg' }}
				/>
				<View style={styles.controls}>
					<TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
						<Ionicons name='ios-skip-backward' size={48} color='#444' />
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
						{this.state.isPlaying ? (
							<Ionicons name='ios-pause' size={48} color='#444' />
						) : (
							<Ionicons name='ios-play-circle' size={48} color='#444' />
						)}
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
						<Ionicons name='ios-skip-forward' size={48} color='#444' />
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
