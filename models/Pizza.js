const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const PizzaSchema = new Schema(
    {
      pizzaName: {
        type: String
      },
      createdBy: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now,
        get: (createdAtVal) => dateFormat(createdAtVal)
      },
      size: {
        type: String,
        default: 'Large'
      },
      toppings: [],
      comments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Comment'
        }
      ]
    },
    {
      toJSON: {
        virtuals: true,
        getters: true
      },
      id: false
    }
);

// Get total count of comments and replies on retrival
PizzaSchema.virtual('commnetCount').get(function(){
    return this.comments.length;
});

// Create the Pizza model using the PizzaSchema

const Pizza = model('Pizza', PizzaSchema);

// Export the pizza model
module.exports = Pizza;