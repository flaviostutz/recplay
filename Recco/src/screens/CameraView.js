'use strict'

import React, {
    Component
} from 'react';

import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import { attachModelToView } from 'rhelena';

import CameraRollSelector from "react-native-camera-roll-selector";
import { Icon } from 'react-native-elements'
import { Spinner } from 'native-base';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';
import CameraRoll from "@react-native-community/cameraroll";

import CameraModel from './CameraModel'

export default class CameraView extends Component {

    constructor(props) {
        super(props);
        attachModelToView(new CameraModel(this.props), this);
    }

    render() {

        console.log('CAMERA RENDER()')

        return (
            <>
                {this.viewModel.showVideoPicker &&
                    <View style={{ flex: 1 }}>
                        <View style={{ height: 100 }}>
                            <Icon
                                name={'chevron-left'}
                                type='entypo'
                                color='black'
                                size={74}
                                style={{ padding: 8 }}
                                onPress={() => { this.viewModel.videoPicker = false }} />
                            <Text>Select a video</Text>
                        </View>
                        <CameraRollSelector callback={this.viewModel.onVideoSelected}
                            assetType="Videos"
                            selectSingleItem={true} />
                    </View>
                }


                {/* CAMERA */}
                {!this.viewModel.showVideoPicker &&
                    <View style={{ flex: 1 }}>
                        <RNCamera
                            ref={ref => {
                                this.viewModel.camera.camera = ref;
                            }}
                            style={[styles.backgroundVideo, this.viewModel.borderRecording()]}

                            //camera recording config
                            type={this.viewModel.type}
                            ratio={this.viewModel.ratio}
                            flashMode={this.viewModel.flash}

                            //events
                            onAudioInterrupted={this.viewModel.onAudioInterrupted}
                            onRecordingStart={this.viewModel.onRecordingStart}
                            onRecordingEnd={this.viewModel.onRecordingEnd}
                            onMountError={this.viewModel.onCameraMountError}
                            // onAudioConnected={this.viewModel.onAudioConnected}
                            // onCameraReady={this.viewModel.onCameraReady}

                            //camera authorization matters
                            onStatusChange={this.onCameraStatusChange}
                            androidCameraPermissionOptions={{
                                title: 'Permission to record camera video',
                                message: 'We need access to your camera in order to record your track',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                            androidRecordAudioPermissionOptions={{
                                title: 'Permission to record audio',
                                message: 'We need access to your microphone in order to record your track',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                            pendingAuthorizationView={
                                <View style={styles.cameraLoading}>
                                    <Spinner color={'gray'} />
                                </View>
                            }
                            notAuthorizedView={
                                <View>
                                    Recco was not authorized to access the camera
                    </View>
                            }
                        >
                        </RNCamera>


                        {/* HEADER */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Recco</Text>
                        </View>


                        {/* TRACKS LIST */}
                        <ScrollView
                            contentInsetAdjustmentBehavior="automatic"
                            style={styles.scrollView}>
                            <View>
                                <View style={styles.scrollRegion}>

                                    {this.viewModel.tracks.map((t) => (
                                        <View>
                                            <TouchableOpacity onPress={() => { this.viewModel.showTrackDialog(t) }}
                                                style={[styles.overlayVideo, t.borderVideo()]}>
                                                <Video source={t.track.source}
                                                    ref={(ref) => {
                                                        t.player = ref
                                                    }}
                                                    style={{ flex: 1 }}
                                                    paused={this.viewModel.paused}
                                                    onProgress={t.onProgress}
                                                    onError={t.onError}
                                                    // onLoad={this.onLoad}
                                                    // onLoadStart={this.onLoadStart}
                                                    // onBuffer={this.onBuffer}
                                                    // onSeek={this.onSeek}
                                                    // onReadyForDisplay={this.onReadyForDisplay}
                                                    volume={t.track.volume} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                </View>

                            </View>
                        </ScrollView>




                        {/* FOOTER */}
                        <View style={styles.footer}>

                            {/* CAMERA ROLL CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showAddCameraRollControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.addTrackFromCameraRoll() }} 
                                                      style={{flex: 0.75}}>
                                        <Video source={this.viewModel.cameraRollImage}
                                            paused={true} style={{flex:1}}
                                        />
                                    </TouchableOpacity>
                                }
                                {/* TIME COUNTER */}
                                {!this.viewModel.showAddCameraRollControl() &&
                                <View style={{flex:1, justifyContent: 'center'}}>
                                    <Text style={{ textAlign: 'center', color: this.viewModel.timeColor(), fontSize: 20, fontWeight: 'bold' }}>01:23</Text>
                                </View>
                                }
                            </View>

                            {/* RECORD CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showRecordControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.toggleRecording() }} style={{ borderWidth: 4 }}>
                                        <Icon
                                            name={this.viewModel.recordIcon()}
                                            type='entypo'
                                            color='#ee4400'
                                            size={74}
                                            style={{ padding: 8 }} />
                                    </TouchableOpacity>
                                }
                            </View>

                            {/* PLAY CONTROL */}
                            <View style={styles.controlArea}>
                                {this.viewModel.showPlayControl() &&
                                    <TouchableOpacity onPress={() => { this.viewModel.togglePlaying() }} style={styles.controlArea}>
                                        <Icon
                                            name={this.viewModel.playIcon()}
                                            type='entypo'
                                            color='#ee4400'
                                            size={58}
                                            style={{ padding: 8 }} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                }
            </>
        );
    }

};


//STYLES
const { height } = Dimensions.get("window");
const styles = StyleSheet.create({

    header: {
        padding: 4,
        height: 60,
        borderWidth: 2
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: 'darkred',
        height: 200,
        top: 18
    },

    backgroundVideo: {
        height: height,
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: -99
    },
    scrollRegion: {
        justifyContent: "space-between"
    },
    overlayVideo: {
        width: 200,
        height: 200,
        zIndex: 10,
        margin: 10,
    },

    footer: {
        padding: 0,
        height: 110,
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    controlArea: {
        flex:1,
        borderWidth: 4,
        justifyContent: 'center'
    },

});