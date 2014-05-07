Sources = new Meteor.Collection("sources");
Questions = new Meteor.Collection("questions", {
  transform: function (doc) {
    doc.headlines = _.select(doc.headlines, function (headline) {
      return headline.text;
    });

    _.map(doc.headlines, function (headline) {
      headline.text = headline.text.toLowerCase();
      return headline;
    });

    return doc;
  }
});

Responses = new Meteor.Collection("responses");

if (Meteor.isClient) {
  Session.setDefault("questionIndex", 0);

  Template.admin.helpers({
    sources: function () {
      return Sources.find({});
    },
    questions: function () {
      return Questions.find({});
    },
    sourceName: function (sourceId) {
      var source = Sources.findOne({_id: sourceId});
      return source && source.name;
    }
  });

  Template.admin.events({
    "click .add-source": function (event, template) {
      event.preventDefault();

      var name = template.find(".new-source-name").value;

      Sources.insert({
        name: name
      });

      template.find(".new-source-name").value = "";
    },
    "submit form": function (event, template) {
      event.preventDefault();

      var formData = FormUtils.serializeForm(template.find("form"));
      formData.headlines = _.map(_.pairs(formData.headlines), function (pair) {
        return {
          sourceId: pair[0],
          text: pair[1]
        };
      });

      formData.createdAt = new Date();

      Questions.insert(formData);
    },
    "click .delete-question": function () {
      Questions.remove({_id: this._id});
    }
  });

  Template.question.helpers({
    bgColor: function (_id) {
      var numberFromId = _.reduce(_id.split(""), function (sum, char) {
        return sum + char.charCodeAt(0);
      }, 0);

      var hue = numberFromId % 360;

      return "hsl(" + hue + ", 60%, 40%)";
    }
  });

  Template.survey.helpers({
    questionsWithIndex: function () {
      return _.map(Questions.find({}).fetch(), function (question, index) {
        question.index = index + 1;

        return question;
      });
    }
  });

  Template.survey.events({
    "submit form": function (event, template) {
      event.preventDefault();

      var formData = FormUtils.serializeForm(template.find("form"));
      formData.createdAt = new Date();

      Responses.insert(formData, function (error, responseId) {
        if (error) {
          // not sure

          alert("There was an error saving your response, sorry.");
        }

        Router.go("response", {_id: responseId});
      });
    }
  });

  Template.response.helpers({
    mostPopular: function () {
      var sourceFrequencies = {};

      _.each(this.headlines, function (sourceId) {
        if (sourceFrequencies[sourceId]) {
          sourceFrequencies[sourceId] += 1;
        } else {
          sourceFrequencies[sourceId] = 1;
        }
      });

      var sourceId = _.max(_.pairs(sourceFrequencies), function (pair) {
        return pair[1];
      })[0];

      return Sources.findOne({_id: sourceId});
    },
    chartBars: function () {
      if (this.headlines) {
        var sourceFrequencies = {};

        _.each(this.headlines, function (sourceId) {
          if (sourceFrequencies[sourceId]) {
            sourceFrequencies[sourceId] += 1;
          } else {
            sourceFrequencies[sourceId] = 1;
          }
        });

        var max = _.max(sourceFrequencies);
        var numQuestions = _.pairs(this.headlines).length;

        var chartBars = [];
        _.each(Sources.find({}).fetch(), function (source) {
          chartBars.push({
            name: source.name,
            barWidth: (sourceFrequencies[source._id] || 0) / max * 100,
            num: (sourceFrequencies[source._id] || 0)
          });
        });

        console.log(chartBars);

        return chartBars;
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
