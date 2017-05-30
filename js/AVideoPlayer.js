var AVideoPlayer = function() {

  // Vals
  this.duration         = 0;
  this.current_progress = 0;
  this.progressWidth    = 4;
  this.paused           = true;

  // Elems
  this.elProgressBar   = null;
  this.elProgressTrack = null;
  this.elProgressFill  = null;
  this.elAlertSound    = null;
  this.elVideo         = null;
  this.elVideoScreen   = null;
  this.elControlBack   = null;
  this.elControlPlay   = null;
  this.elControlVolume = null;

  this._initElements = function() {
    this.elProgressBar   = document.getElementById('progress-bar');
    this.elProgressTrack = document.getElementById('progress-bar-track');
    this.elProgressFill  = document.getElementById('progress-bar-fill');
    this.elAlertSound    = document.getElementById('alert-sound');
    this.elVideo         = document.getElementById('video-src');
    this.elVideoScreen   = document.getElementById('video-screen');
    this.elControlBack   = document.getElementById('control-back');
    this.elControlPlay   = document.getElementById('control-play');
    this.elControlVolume = document.getElementById('control-volume');
  }

  /*this._determinateProgressWidth = function() {
    this.progressWidth = this.elProgressBar.getAttribute('geometry').width;
  }*/

  /**
  * PROGRESS
  */
  this.setProgress = function(progress) {
    /*if (this.progressWidth == undefined) {
      this.progressWidth == 4;
    }*/
    var new_progress = this.progressWidth*progress;
    this._setProgressWidth(new_progress);
    var progress_coord = this._getProgressCoord();
    if (progress_coord != undefined) {
      progress_coord.x = -(this.progressWidth-new_progress)/2;
      this._setProgressCoord(progress_coord);
    }
  }
  this._getProgressCoord = function() {
    return AFRAME.utils.coordinates.parse(this.elProgressFill.getAttribute("position"))
  }
  this._getProgressWidth = function() {
    return parseFloat(this.elProgressFill.getAttribute("width"));
  }
  this._setProgressCoord = function(coord) {
    this.elProgressFill.setAttribute("position", coord);
  }
  this._setProgressWidth = function(width) {
    this.elProgressFill.setAttribute("width", width);
  }

  /*
  * UI SETTERS
  */
  this.isProgressBarVisible = function(isVisible) {
    this.elProgressTrack.setAttribute("visible", isVisible);
    this.elProgressFill.setAttribute("visible", isVisible);
  }
  this.isControlVisible = function(isVisible) {
    this.elControlBack.setAttribute("visible", isVisible);
    this.elControlVolume.setAttribute("visible", isVisible);
  }

  /*
  * EVENTS
  */
  this._addPlayerEvents = function() {
    var that = this;
    this.elVideo.pause();
    this.elVideo.onplay = function() {
      that.duration = this.duration;
    }
    this.elVideo.ontimeupdate = function() {
      if (that.duration > 0) {
        that.current_progress = this.currentTime/that.duration;
      }
      that.setProgress(that.current_progress);
    }
  }

  this._addControlsEvent = function() {
    var that = this;

    this.elControlPlay.addEventListener('click', function () {
      that._playAudioAlert();
      if (that.elVideo.paused) {
        this.setAttribute('src', '#pause');
        that.elVideo.play();
        that.paused = false;
        that.isProgressBarVisible(true);
        that.isControlVisible(true);
      } else {
        this.setAttribute('src', '#play');
        that.elVideo.pause();
        that.paused = true;
        that.isProgressBarVisible(false);
        that.isControlVisible(false);
      }
    });

    this.elControlVolume.addEventListener('click', function () {
      that._playAudioAlert();
      if (that.elVideo.muted) {
        that.elVideo.muted = false;
        this.setAttribute('src', '#volume-normal');
      } else {
        that.elVideo.muted = true;
        this.setAttribute('src', '#volume-mute');
      }
    });

    this.elControlBack.addEventListener('click', function () {
      that._playAudioAlert();
      that.elVideo.currentTime = 0;
    });
  }

  this._addProgressEvent = function() {
    var that = this;
    this.elProgressBar.addEventListener('click', function (e) {
      if (e.detail == undefined || e.detail.intersection == undefined || that.duration === 0) {
        return;
      }
      let seekedPosition = (e.detail.intersection.point.x+(that.progressWidth/2))/that.progressWidth;
      try {
        let seekedTime = seekedPosition*that.duration;
        that.elVideo.currentTime = seekedTime;
      } catch (e) {
      }
    });
  }

  this._playAudioAlert = function() {
    if (this.elAlertSound.components !== undefined && this.elAlertSound.components.sound !== undefined) {
      this.elAlertSound.components.sound.playSound();
    }
  }

  /**
  * MOBILE PATCH TO PLAY VIDEO
  */
  this._mobileFriendly = function() {
    if (AFRAME.utils.device.isMobile()) {
      var that = this;
      let video_permission        = document.getElementById('video-permission');
      let video_permission_button = document.getElementById('video-permission-button');

      video_permission.style.display = 'block';
      video_permission_button.addEventListener("click", function() {
        video_permission.style.display = 'none';
        that.elVideo.play();
        that.elVideo.pause();
      }, false);
    }
  }

  this.init = function() {
    this._initElements();
    //this._determinateProgressWidth();
    this.setProgress(this.current_progress);
    this._addPlayerEvents();
    this._addControlsEvent();
    this._addProgressEvent();
    this._mobileFriendly();
  }

  this.init();
}
