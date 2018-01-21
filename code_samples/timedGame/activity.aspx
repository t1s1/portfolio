<%@ Language="C#" %>
<script>
  var queryString = '<%= Request.Form %>';
  var queryStringDecoded = decodeURIComponent((queryString + '').replace(/\+/g, '%20'));


  // adapted from http://7php.com
  function getQueryParams(str) {

    var pairs = str.split("&");
    var keyValue_Collection = {};

    for (var value in pairs) {
      //let's get the position of the first occurrence of "=", in case value has "=" in it
      var equalsignPosition = pairs[value].indexOf("=");

      //in case there's only the key
      if (equalsignPosition == -1) {
        keyValue_Collection[pairs[value]] = ''; //you could change the value to true as per your needs
      }
      else {
        keyValue_Collection[pairs[value].substring(0, equalsignPosition)] = pairs[value].substr(equalsignPosition + 1);
      }
    }
    return keyValue_Collection;
  }


  /*************** TIMED GAME ****************/

  function timedGame(queryObj) {
    var id;
    var $gameContainer;
    var $score, $scorePlus;
    var timer;
    var gameConfigObj;
    var cutScore = 60; // percent
    var levelScore = 1;
    var totalScore = 0;
    var introText = "PLAY"; // just a default, should be replaced by text from xml
    var timePerLevel = 10; // seconds
    var gated = false; // prevent forward navigation in CHUTE (default is allow)
    var activityObj = getAttributesAndConfiguration(queryObj);
    var imagesContent = getContent(queryObj, 'imageContent');
    var textboxesContent = getContent(queryObj, 'textboxContent');
    var pathToThis = queryObj.path;
    var numIncorrectFeedbacks = 0;
    var numSets = 0;
    var font = 'Tahoma';
    var introCSS = {
      'position': 'absolute',
      'left': '1000px', // animates to 84px
      'top': '60px',
      'width': '834px',
      'height': '340px',
      'font-family': font,
      'font-size': '22px',
      'line-height': '34px',
      'color': '#444',
      'opacity': '0'
    };
    var startBtnCSS = {
      'position': 'absolute',
      'right': '0',
      'top': '308px',
      'width': '180px',
      'height': '28px',
      'font-family': font,
      'text-align': 'right',
      'padding-right': '60px',
      'font-size': '22px',
      'line-height': '28px',
      'color': '#c90',
      'cursor': 'pointer'
    };
    var startBtnImgCSS = {
      'position': 'absolute',
      'right': '0',
      'top': '2px',
      'width': '40px',
      'height': '28px'
    };
    var instructionsCSS = {
      'position': 'absolute',
      'left': '18px',
      'top': '30px',
      'width': '710px',
      'height': '60px',
      'font-family': font,
      'text-align': 'left',
      'font-size': '14px',
      'line-height': '18px',
      'color': '#444'
    };
    var timerCSS = {
      'position': 'absolute',
      'left': '400px',
      'top': '24px',
      'height': '28px',
      'width': '600px',
    };
    var timerCircleCSS_ON = {
      'float': 'right',
      'width': '40px',
      'height': '28px',
      'background-position': '0 0'
    };
    var timerCircleCSS_OFF = {
      'background-position': '0 28px'
    };
    var scoreCSS = {
      'position': 'absolute',
      'left': '480px',
      'top': '414px',
      'width': '200px',
      'height': '28px',
      'font-family': font,
      'text-align': 'right',
      'font-size': '22px',
      'line-height': '28px',
      'color': '#8f8f8f'
    };
    var scorePlusCSS = {
      'position': 'absolute',
      'left': '690px',
      'top': '414px',
      'width': '200px',
      'height': '28px',
      'font-family': font,
      'text-align': 'left',
      'font-size': '22px',
      'line-height': '28px',
      'color': '#8f8f8f'
    };
    var questionCSS = {
      'position': 'absolute',
      'left': '1000px', // animates to 30px
      'top': '135px',
      'width': '466px',
      'height': '290px',
      'font-family': font,
      'text-align': 'center',
      'padding-right': '60px',
      'font-size': '26px',
      'line-height': '30px',
      'color': '#444',
      'opacity': '0'
    };
    var answerCSS = {
      'position': 'absolute',
      'left': '-500px', // animates to 516px
      'top': '180px',
      'width': '436px',
      'height': '204px',
      'opacity': '0'
    };
    var answerBlockCSS = {
      'position': 'relative',
      'margin-bottom': '18px',
      'width': '436px',
      'height': '56px',
      'text-align': 'center',
      'font-family': font,
      'font-size': '22px',
      'line-height': '56px',
      'color': '#000',
      'cursor': 'pointer'
    };
    var answerBlock_Indigo = '#0066cc';
    var answerBlock_Blue = '#00adee';
    var answerBlock_Green = '#a5ce39';
    var feedbackCSS = {
      'position': 'absolute',
      'left': '1000px', // animates to 506px
      'top': '90px',
      'width': '508px',
      'height': '220px',
      'padding-left': '46px',
      'padding-top': '16px',
      'font-family': font,
      'text-align': 'left',
      'padding-right': '60px',
      'font-size': '28px',
      'line-height': '34px',
      'color': '#fff',
      'opacity': '0'
    };
    var feedbackSalespersonCSS = {
      'position': 'absolute',
      'left': '-200px', // animates to 98px
      'top': '40px',
      'width': '204px',
      'height': '372px',
      'opacity': '0'
    };
    var feedbackSalespersonTitleCSS = {
      'position': 'absolute',
      'left': '0',
      'top': '0',
      'width': '204px',
      'height': '56px',
      'font-family': font,
      'text-align': 'center',
      'font-size': '22px',
      'line-height': '28px',
      'color': '#2691ce'
    };
    var feedbackSalespersonWhoCSS = {
      'position': 'absolute',
      'left': '0',
      'top': '56px',
      'width': '204px',
      'height': '268px',
      'font-family': font,
      'text-align': 'center',
      'font-size': '72px',
      'line-height': '160px',
      'color': '#737475'
    };
    var feedbackSalespersonNameCSS = {
      'position': 'absolute',
      'left': '0',
      'top': '324px',
      'width': '204px',
      'height': '48px',
      'font-family': font,
      'text-align': 'center',
      'font-size': '22px',
      'line-height': '48px',
      'color': '#737475'
    };
    var feedbackIncorrectSpecificCSS = {
      'position': 'absolute',
      'left': '125px',
      'top': '72px',
      'width': '352px',
      'height': '104px',
      'font-family': font,
      'text-align': 'left',
      'font-size': '22px',
      'line-height': '26px',
      'color': '#fff'
    };
    var tryAgainCSS = {
      'position': 'absolute',
      'left': '440px',
      'top': '365px',
      'width': '294px',
      'height': '36px',
      'font-family': font,
      'text-align': 'right',
      'padding-right': '60px',
      'font-size': '28px',
      'line-height': '34px',
      'color': '#2691ce',
      'cursor': 'pointer'
    };


    function createElement($container, id) {
      if ($('#' + id).length > 0) {
        return $('#' + id);
      }
      else {
        return $('<div id="' + id + '"></div>').appendTo($container);
      }
    }

    function extractObjectFromString(obj, str, value) {
      var subParam;
      var openBracketIndex = str.indexOf('[') + 1;
      var closeBracketIndex = str.indexOf(']');
      var param = str.slice(openBracketIndex, closeBracketIndex);
      var stringToEnd = str.slice(closeBracketIndex + 1);

      // is there another level beyond this one?
      if (str.charAt(closeBracketIndex + 1) === '[') {
        subParam = stringToEnd.slice(stringToEnd.indexOf('[') + 1, stringToEnd.indexOf(']'));
        if (obj[param] === undefined) {
          obj[param] = {};
        }
        obj[param][subParam] = extractObjectFromString(obj[param], stringToEnd, value);
      }
      else {
        obj[param] = value;
      }
      return obj[param];
    }
    // get all of the attributes and configuration object
    function getAttributesAndConfiguration(obj) {
      var activityAssetObj = {};
      var param, openBracketIndex, closeBracketIndex, stringToEnd;

      // get assets
      for (var prop in obj) {
        if (prop.indexOf('asset') !== -1) {
          openBracketIndex = prop.indexOf('[') + 1;
          closeBracketIndex = prop.indexOf(']');
          stringToEnd = prop.slice(closeBracketIndex + 1);

          param = prop.slice(openBracketIndex, closeBracketIndex);
          // is there another level beyond this one?
          if (prop.charAt(closeBracketIndex + 1) === '[') {
            subParam = stringToEnd.slice(stringToEnd.indexOf('[') + 1, stringToEnd.indexOf(']'));
            if (activityAssetObj[param] === undefined) {
              activityAssetObj[param] = {};
            }
            activityAssetObj[param][subParam] = extractObjectFromString(activityAssetObj[param], stringToEnd, obj[prop]);
          }
          else {
            activityAssetObj[param] = obj[prop];
          }
        }
      }
      return activityAssetObj;
    }

    // get content object from JSON
    function getContent(obj, contentType) {
      var contentObj = {};
      var param, openBracketIndex, closeBracketIndex;

      for (var prop in obj) {
        if (prop.indexOf(contentType) !== -1) {
          openBracketIndex = prop.indexOf('[') + 1;
          closeBracketIndex = prop.indexOf(']');
          param = prop.slice(openBracketIndex, closeBracketIndex);
          contentObj[param] = decodeURIComponent(obj[prop]);
        }
      }
      return contentObj;
    }

    // set up property for given property name
    function setConfigObjProp(propName) {
      var attribute;

      function findContentById(val) {
        // check textboxes
        for (var prop in textboxesContent) {
          if (prop === val) {
            return textboxesContent[prop];
          }
        }
        // check images
        for (var prop in imagesContent) {
          if (prop === val) {
            // return the path plus the source
            return pathToThis + imagesContent[prop];
          }
        }
        // if nothing found, and it's an object
        if (typeof val === 'object') {
          // recurse
          for (var attrName in val) {
            attribute = attrName.slice(attrName.indexOf('@') + 1);
            val[attribute] = findContentById(val[attrName]);
          }
        }
        // or else just return the value that was there
        return val;
      }

      if (gameConfigObj[propName] !== undefined) {
        for (var attrName in gameConfigObj[propName]) {
          attribute = attrName.slice(attrName.indexOf('@') + 1);

          if (gameConfigObj[propName] === undefined) {
            gameConfigObj[propName] = {};
          }
          gameConfigObj[propName][attribute] = findContentById(gameConfigObj[propName][attrName]);
        }
      }
      return gameConfigObj;
    }

    /* 
     * shows results at end of set (level)
     */
    function showResults() {
      var percentScore = 100 * totalScore / (numSets * levelScore);
      var $feedback,
          $tryAgain,
          $feedbackSalesperson,
          $feedbackSalesperson_title,
          $feedbackSalesperson_who,
          $feedbackSalesperson_name,
          $incorrectSpecific;

      function showElements() {
        $feedback.show();
        $feedbackSalesperson.show();
        $feedbackSalesperson.animate({
          'left': '98px',
          'opacity': '1.0'
        }, 'slow', 'swing');
        $feedback.animate({
          'left': '506px',
          'opacity': '1.0'
        }, 'slow', 'swing');
      }

      function hideElements() {
        $feedbackSalesperson.animate({
          'left': '-400px',
          'opacity': '0'
        }, 'swing', function () {
          $(this).hide();
          $(this).empty();
        });
        $feedback.animate({
          'left': '1000px',
          'opacity': '0'
        }, 'swing', function () {
          $(this).hide();
          $(this).empty();
          $tryAgain.hide();
          $score.hide();
          reset();
        });
      }

      function showCorrectFeedback() {
        // allow navigation forward if gated
        var metadata = vm.CurrentLesson().CurrentScreen().MetaData();
        if (gated) {
          // hack
          if (metadata.events === undefined) {
            metadata['events'] = [];
          }
          if (metadata.events.click === undefined) {
            metadata.events['click'] = [];
          }
          if (metadata.events.click[0] === undefined) {
            metadata['events']['click'][0] = ['@id'];
            metadata['events']['click'][0]['@id'] = id;
          }
          vm.CurrentLesson().CurrentScreen().CanMoveNext(true);
        }

        // "plaque" at left with salesperson
        $feedbackSalesperson = createElement($gameContainer, id + '_correct');
        // empty in case this is not the first time
        $feedbackSalesperson.empty();
        $feedbackSalesperson.css(feedbackSalespersonCSS);
        $feedbackSalesperson_title = $('<div id="' + id + '_feedback_title"></div>').appendTo($feedbackSalesperson);
        $feedbackSalesperson_title.html(gameConfigObj.results.textbox.id);
        $feedbackSalesperson_title.css(feedbackSalespersonTitleCSS);
        $feedbackSalesperson_who = $('<div id="' + id + '_feedback_title"></div>').appendTo($feedbackSalesperson);
        $feedbackSalesperson_who.html(gameConfigObj.results_correct_1.id);
        $feedbackSalesperson_who.css(feedbackSalespersonWhoCSS);
        $feedbackSalesperson.show();

        // text on die
        // "congratulations" text
        $feedback.html(gameConfigObj.results_correct.id);
      }

      function showIncorrectFeedback() {
        var objToShow;

        // choose one of the incorrect choices at random
        objToShow = gameConfigObj['results_incorrect_' + ((Math.floor(Math.random() * numIncorrectFeedbacks)) + 1)];
        
        // "plaque" at left with salesperson
        $feedbackSalesperson = createElement($gameContainer, id + '_incorrect');
        // empty in case this is not the first time
        $feedbackSalesperson.empty();
        $feedbackSalesperson.css(feedbackSalespersonCSS);
        $feedbackSalesperson_title = $('<div id="' + id + '_feedback_title"></div>').appendTo($feedbackSalesperson);
        $feedbackSalesperson_title.html(gameConfigObj.results.textbox.id);
        $feedbackSalesperson_title.css(feedbackSalespersonTitleCSS);
        $feedbackSalesperson_who = $('<img src="' + objToShow.image.id + '"/>').appendTo($feedbackSalesperson);
        $feedbackSalesperson_who.css(feedbackSalespersonWhoCSS);
        $feedbackSalesperson_name = $('<div id="' + id + '_feedback_name"></div>').appendTo($feedbackSalesperson);
        $feedbackSalesperson_name.html(objToShow.textbox[1].id);
        $feedbackSalesperson_name.css(feedbackSalespersonNameCSS);

        // text on die
        // "sorry" text
        $feedback.html(gameConfigObj.results_incorrect.id);
        // this salesperson beat you
        $incorrectSpecific = createElement($feedback, id + '_incorrectSpecific');
        $incorrectSpecific.html(objToShow.textbox[0].id);
        $incorrectSpecific.css(feedbackIncorrectSpecificCSS);
        $incorrectSpecific.show();

        // Try Again button
        $tryAgain = createElement($gameContainer, id + '_tryAgain');
        $tryAgain.html(gameConfigObj.tryAgain.textbox.id);
        $tryAgain.css(tryAgainCSS);
        $tryAgain.css('background', 'url("' + gameConfigObj.tryAgain.image.id + '") 320px 0 no-repeat');
        $tryAgain.show();
        $tryAgain.off('click'); // clear any old click handlers
        $tryAgain.click({}, function (e) {
          hideElements();
        });
      }

      // container for feedback, good or bad
      $feedback = createElement($gameContainer, id + '_feedback');
      $feedback.css(feedbackCSS);
      $feedback.css('background', 'url("' + gameConfigObj.results.image.id + '") no-repeat');
      $feedback.html(gameConfigObj.results.textbox.id);

      // show appropriate feedback
      if (percentScore >= cutScore) {
        showCorrectFeedback();
      }
      else {
        showIncorrectFeedback();
      }

      showElements();
    }

    /* 
     * main game loop
     */
    function play() {
      var setNum = 1;
      var timerCount = 0;
      var questionDivId = id + '_question';
      var answerDivId = id + '_answers';
      var $question, $answerDiv, $instructions, $timer;
      var timerCircles = [];

      function updateScore(scoreToAdd) {
        totalScore += scoreToAdd;
        // fade in and out points
        if (scoreToAdd > 0) {
          $scorePlus.html('+ ' + scoreToAdd);
          $scorePlus.fadeIn('fast', function () {
            // Animation complete
            $(this).fadeOut('slow');
          });
        }
        
        $score.html(gameConfigObj.score_text.id + ': ' + totalScore);
      }

      function countDown() {
        if (timerCount === timePerLevel) {
          // start with new set
          clearInterval(timer);
          setNum++;
          clearAndReset();
        }
        else {
          timerCircles[timerCount].css(timerCircleCSS_OFF);
          timerCount++;
        }
      }

      // clear and park question and answers, showSet() when done
      function clearAndReset() {
        $question.animate({
          'left': '-400px',
          'opacity': '0'
        }, 'swing', function () {
          $(this).hide();
          $(this).empty();
        });
        $answerDiv.animate({
          'left': '1000px',
          'opacity': '0'
        }, 'swing', function () {
          $(this).hide();
          $(this).empty();
          // ready to go
          showSet();
        });
      }

      function showSet() {
        var answers = [];
        var answersIndex = 0;
        var thisIsCorrectAnswer;

        // if no more questions, then we're done
        if (setNum > numSets) {
          $instructions.hide();
          $timer.empty();
          $timer.hide();
          
          showResults();
        }
        else {

          // restart timer
          for (var i = 0; i < timePerLevel; i++) {
            timerCircles[i].css(timerCircleCSS_ON);
          }
          timerCount = 0;
          timer = setInterval(countDown, 1000);

          // build answers
          for (var prop in gameConfigObj['set_' + setNum]) {
            if (prop.indexOf('answer_') === 0) {
              answersIndex++;
              answers.push($('<div id="' + id + '_set' + setNum + '_answer_' + answersIndex + '"></div>').appendTo('#' + answerDivId));
              answers[answers.length - 1].html(gameConfigObj['set_' + setNum]['answer_' + answersIndex]);
              // set styles
              answers[answers.length - 1].css(answerBlockCSS);
              // pick one of the three colors, in rotation if there are more than 3
              answers[answers.length - 1].css('background-color', [answerBlock_Indigo, answerBlock_Blue, answerBlock_Green][(answers.length-1) % 3]);
              // assign value for whether this answer is correct
              thisIsCorrectAnswer = ('answer_' + answersIndex === gameConfigObj['set_' + setNum].correct_answer) ? true : false
              // click handler
              answers[answers.length - 1].off('click'); // clear any old click handlers
              answers[answers.length - 1].click({ isCorrect: thisIsCorrectAnswer }, function (e) {
                if (e.data.isCorrect) {
                  updateScore(parseInt(levelScore, 10));
                }
                // start with new set
                clearInterval(timer);
                setNum++;
                clearAndReset();
              });
            }
          }
          $question.html(gameConfigObj['set_' + setNum].question);
          $question.show();
          $question.animate({
            'left': '30px',
            'opacity': '1.0'
          }, 'swing');
          $answerDiv.show();
          $answerDiv.animate({
            'left': '516px',
            'opacity': '1.0'
          }, 'swing');
        }
      }

      // instructions
      $instructions = createElement($gameContainer, id + '_instructions');
      $instructions.html(gameConfigObj.instructions.id);
      $instructions.css(instructionsCSS);
      $instructions.show();

      // timer
      $timer = createElement($gameContainer, id + '_timer');
      for (var i = 0; i < timePerLevel; i++) {
        timerCircles[i] = createElement($timer, id + '_timerCircle_' + i);
        timerCircles[i].css(timerCircleCSS_ON);
        timerCircles[i].css('background-image', 'url("'+gameConfigObj.timer.id+'")');
      }
      $timer.css(timerCSS);
      $timer.show();

      // Player's score and points added (scorePlus)
      $score = createElement($gameContainer, id + '_score');
      $score.css(scoreCSS);
      $score.show();
      $scorePlus = createElement($gameContainer, id + '_scorePlus');
      $scorePlus.css(scorePlusCSS);
      $scorePlus.hide(); // don't want to see this yet
      updateScore(0); // just to initialize


      // question and answer section
      $question = createElement($gameContainer, questionDivId);
      $question.css(questionCSS);
      $answerDiv = createElement($gameContainer, answerDivId);
      $answerDiv.css(answerCSS);

      clearAndReset();      
    }

    //
    function reset() {
      clearInterval(timer);
      totalScore = 0;
      showIntro();
    }

    // begin gameplay from scratch
    function start($intro) {
      $intro.animate({
        'left': '1000px',
        'opacity': '0'
      }, 'swing', function () {
        $(this).hide();
        play();
      });
      
      
    }

    function configure() {
      gameConfigObj = activityObj.configuration;

      // game id
      if (activityObj['@id'] !== undefined && activityObj['@id'] !== '') {
        id = activityObj['@id']
      }

      // score to pass
      if (gameConfigObj['@cut_score'] !== undefined && gameConfigObj['@cut_score'] !== '') {
        cutScore = gameConfigObj['@cut_score']
      }
      // score per correct answer
      if (gameConfigObj['@score_per_correct'] !== undefined && gameConfigObj['@score_per_correct'] !== '') {
        levelScore = gameConfigObj['@score_per_correct']
      }
      // time per level
      if (gameConfigObj['@time_per_level'] !== undefined && gameConfigObj['@time_per_level'] !== '') {
        timePerLevel = parseInt(gameConfigObj['@time_per_level'], 10);
      }

      // set up intro
      setConfigObjProp('intro');
      setConfigObjProp('start');

      // set up instructions and timer
      setConfigObjProp('instructions');
      setConfigObjProp('timer');

      // set up game sets (questions and answers)
      for (var si = 1; gameConfigObj['set_' + si] !== undefined; si++) {
        numSets = si;
        setConfigObjProp('set_' + si);
      }

      // set up results
      setConfigObjProp('results');
      setConfigObjProp('results_correct');
      setConfigObjProp('results_correct_1');
      setConfigObjProp('results_incorrect');
      for (var ri = 1; gameConfigObj['results_incorrect_' + ri] !== undefined; ri++) {
        numIncorrectFeedbacks = ri;
        setConfigObjProp('results_incorrect_' + ri);
      }
      setConfigObjProp('tryAgain');
      setConfigObjProp('score_text');

    }

    function showIntro() {
      var introDivId = id + '_intro';
      var startDivId = id + '_start';
      var $intro, $startBtn;

      // build intro
      $intro = createElement($gameContainer, introDivId);
      $intro.html(gameConfigObj.intro.id);
      $intro.css(introCSS);
      $intro.addClass('large');
      $intro.show();
      $intro.animate({
        'left': '84px',
        'opacity': '1.0'
      }, 'swing');

      // add button to start
      $startBtn = $('<div id="' + startDivId + '"></div>').appendTo($intro);
      $startBtn.html(gameConfigObj.start.textbox.id);
      $startBtn.css(startBtnCSS);
      $startBtn.css('background', 'url("' + gameConfigObj.start.image.id + '") 208px 2px no-repeat');
      $startBtn.off('click'); // clear any old click handlers
      $startBtn.click({ $intro: $intro }, function (e) {
        start(e.data.$intro);
      });

    }

    // call when ready to get started
    function init() {
      configure();
      $gameContainer = $('#' + id);
      reset();
      if(vm.CurrentLesson().CurrentScreen().MetaData()['@gateContinueUntilComplete'] === 'true') {
        gated = true;
        vm.CurrentLesson().CurrentScreen().CanMoveNext(false);
      }
      // we want to be notified when current screen changes so we can clean up
      vm.CurrentLesson().CurrentScreen.subscribe(function () {
        reset();
      });
    }

    return {
      init: init
    }
  };

  /*********** END DECLARATIONS ************/

  var queryObj = getQueryParams(queryStringDecoded);

  var game = timedGame(queryObj);

  game.init();


  /* DEBUG */
  //console.log(queryString);
  //console.log(queryStringDecoded);

</script>