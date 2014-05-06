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

      console.log(formData);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
