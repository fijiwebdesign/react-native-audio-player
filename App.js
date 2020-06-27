import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AudioPlayer } from './AudioPlayer'

const audioBookPlaylist = [
	{
		title: 'Hamlet - Act I',
		author: 'William Shakespeare',
		source: 'Librivox',
		uri:
			'https://ia800204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act1_shakespeare.mp3',
		imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
	},
	{
		title: 'Hamlet - Act II',
		author: 'William Shakespeare',
		source: 'Librivox',
		uri:
			'https://ia600204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act2_shakespeare.mp3',
		imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
	},
	{
		title: 'Hamlet - Act III',
		author: 'William Shakespeare',
		source: 'Librivox',
		uri: 'http://www.archive.org/download/hamlet_0911_librivox/hamlet_act3_shakespeare.mp3',
		imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
	},
	{
		title: 'Hamlet - Act IV',
		author: 'William Shakespeare',
		source: 'Librivox',
		uri:
			'https://ia800204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act4_shakespeare.mp3',
		imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
	},
	{
		title: 'Hamlet - Act V',
		author: 'William Shakespeare',
		source: 'Librivox',
		uri:
			'https://ia600204.us.archive.org/11/items/hamlet_0911_librivox/hamlet_act5_shakespeare.mp3',
		imageSource: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg'
	}
]

export default class App extends React.Component {

  renderPlayer = player => {
    return (
      <View style={styles.container}>
        <h1>Music Player</h1>
        <Image
          style={styles.albumCover}
          source={{ uri: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg' }}
        />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.control} onPress={player.handlePreviousTrack}>
            <Ionicons name='ios-skip-backward' size={48} color='#444' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={player.handlePlayPause}>
            {player.state.isPlaying ? (
              <Ionicons name='ios-pause' size={48} color='#444' />
            ) : (
              <Ionicons name='ios-play-circle' size={48} color='#444' />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={player.handleNextTrack}>
            <Ionicons name='ios-skip-forward' size={48} color='#444' />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  handleError = error => {
    alert('An error occurred. See the Dev console for details')
    console.error(error)
  }
	
	render() {
		return (
      <AudioPlayer
        style={styles.container}
        playlist={audioBookPlaylist}
        //renderPlayer={this.renderPlayer}
        onError={this.handleError}
      />
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
