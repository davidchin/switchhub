<a name="1.0.0"></a>
# [1.0.0](https://github.com/davidchin/switchhub/compare/0.2.1...1.0.0) (2017-02-08)


### Features

* Ability to create and configure a state machine at the same time ([dd64bb2](https://github.com/davidchin/switchhub/commit/dd64bb2))
* Ability to undo and redo state transitions ([f0a991c](https://github.com/davidchin/switchhub/commit/f0a991c))
* Ability to check if it is possible to undo or redo ([c32f06a](https://github.com/davidchin/switchhub/commit/c32f06a))
* Ability to pass additional meta data to subscribers ([905c104](https://github.com/davidchin/switchhub/commit/905c104))
* Rename `transitionByEvent` method to `triggerEvent` ([9bb73a0](https://github.com/davidchin/switchhub/commit/9bb73a0))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/davidchin/switchhub/compare/0.2.0...0.2.1) (2017-02-03)


### Bug Fixes

* When matching transitions, make sure the filter condition is undefined before skipping ([42ddf5b](https://github.com/davidchin/switchhub/commit/42ddf5b))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/davidchin/switchhub/compare/0.1.0...0.2.0) (2017-01-14)


### Bug Fixes

* Throw an error when adding an event without at least one transition ([395ec1a](https://github.com/davidchin/switchhub/commit/395ec1a))


### Features

* Add convenience methods for registering multiple events and transitions ([4555b98](https://github.com/davidchin/switchhub/commit/4555b98))
* Add a getter that returns the previous state of a state machine ([3f7bb6b](https://github.com/davidchin/switchhub/commit/3f7bb6b))



<a name="0.1.0"></a>
# 0.1.0 (2017-01-09)


### Features

* Add `StateMachine` module ([30d3bae](https://github.com/davidchin/switchhub/commit/30d3bae))
