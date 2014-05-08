Template.results.helpers({
  questions: function () {
    return Questions.find({});
  },
  responses: function () {
    return Responses.find({});
  },
  sourceName: function (response) {
    if (response && response.headlines) {
      var source = Sources.findOne(response.headlines[this._id]);
      return source && source.name;
    }
  },
  headlines: function () {
    if (this.headlines) {
      return _.pairs(this.headlines);
    }
  }
});