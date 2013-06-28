/*jslint nomen: true, node: true */
/*globals YUI*/
/*globals window*/

/*
 * Copyright (c) 2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

YUI.add("yuitest-sinon", function (Y) {

    'use strict';
    Y.namespace("Arrow");

    function attachSinon(sinon, config) {

        /*
         for basic methods spy,stub and mock,attach to Y.Arrow.Mock
         You can call sinon.spy or Y.Arrow.Mock.spy(or this.spy),
         the difference is Y.Arrow.Mock.spy is wrapped with sandbox,
         so don't have to call restore
         */

        Y.Arrow.Mock.sinon = sinon;
        sinon.config = config;

        (function () {
            var ytestcase = Y.Test.Case.prototype;
            Y.Test.Case = function (template) {

                /*
                 template is like :{
                 setup:function(){}
                 teardown:function(){}
                 'some test':function(){}
                 }

                 What we want is warp them in a sandbox: sinon.test(function)

                 Wrapping test methods in sinon.test allows Sinon.JS to automatically create and manage sandboxes for you.
                 The function's behavior can be configured through sinon.config.

                 var wrappedFn = sinon.test(fn);

                 The wrappedFn function works exactly like the original one in all respect -
                 in addition a sandbox object is created and automatically restored when the function finishes a call.
                 By default the spy, stub and mock properties of the sandbox is bound to whatever object the function is run on,
                 so you can do this.spy() (and stub, mock) and it works exactly like sandbox.spy() (and stub, mock),
                 except you don't need to manually restore().

                 */

                /*
                 * Special rules for the test case. Possible subobjects
                 * are fail, for tests that should fail, and error, for
                 * tests that should throw an error.
                 */
                this._should = {};

                /*  we can do like this:
                 for (var prop in template) {
                 if (typeof template[prop] == 'function') {
                 template[prop] = sinon.test(template[prop]);
                 }
                 }
                 */

                /* but here is more powerful:
                 If you need the behavior of sinon.test for more than one test method in a test case,
                 you can use sinon.testCase, which behaves exactly like wrapping each test in sinon.test
                 with one exception: setUp and tearDown can share fakes.
                 */
                template = sinon.testCase(template);

                //copy over all properties from the template to this object
                for (var prop in template) {
                    this[prop] = template[prop];
                }

                //check for a valid name
                if (typeof this.name != "string") {
                    this.name = YUITest.guid("testCase_");
                }

            }

            Y.Test.Case.prototype = ytestcase;
            Y.Test.Case.prototype.constructor = Y.Test.Case;

        })();
    }

    var sinon, isNode = typeof window === "undefined" && typeof require === "function";

    if (isNode) {

        var config = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock"],
            useFakeTimers: false,
            useFakeServer: false
        };

        sinon = require(__dirname + '/../../node_modules/sinon');
        attachSinon(sinon, config);

    } else {

        var config = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: false,
            useFakeServer: true
        };

        attachSinon(window.sinon || {}, config);
        Y.Arrow.Mock.xmlHttpRequest = window.sinon.useFakeXMLHttpRequest();
        Y.Arrow.Mock.fakeServer = window.sinon.fakeServer.create();

    }

}, "0.1", {
    requires: ["arrow-mock-base", "http://sinonjs.org/releases/sinon-1.7.1.js"]
});
