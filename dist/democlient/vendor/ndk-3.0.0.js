var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod3) => function __require() {
  return mod3 || (0, cb[__getOwnPropNames(cb)[0]])((mod3 = { exports: {} }).exports, mod3), mod3.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod3, isNodeMode, target) => (target = mod3 != null ? __create(__getProtoOf(mod3)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod3 || !mod3.__esModule ? __defProp(target, "default", { value: mod3, enumerable: true }) : target,
  mod3
));

// ../node_modules/tseep/lib/types.js
var require_types = __commonJS({
  "../node_modules/tseep/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// ../node_modules/tseep/lib/task-collection/utils.js
var require_utils = __commonJS({
  "../node_modules/tseep/lib/task-collection/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._fast_remove_single = void 0;
    function _fast_remove_single(arr, index) {
      if (index === -1)
        return;
      if (index === 0)
        arr.shift();
      else if (index === arr.length - 1)
        arr.length = arr.length - 1;
      else
        arr.splice(index, 1);
    }
    exports2._fast_remove_single = _fast_remove_single;
  }
});

// ../node_modules/tseep/lib/task-collection/bake-collection.js
var require_bake_collection = __commonJS({
  "../node_modules/tseep/lib/task-collection/bake-collection.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bakeCollectionVariadic = exports.bakeCollectionAwait = exports.bakeCollection = exports.BAKED_EMPTY_FUNC = void 0;
    exports.BAKED_EMPTY_FUNC = (function() {
    });
    var FORLOOP_FALLBACK = 1500;
    function generateArgsDefCode(numArgs) {
      var argsDefCode2 = "";
      if (numArgs === 0)
        return argsDefCode2;
      for (var i2 = 0; i2 < numArgs - 1; ++i2) {
        argsDefCode2 += "arg" + String(i2) + ", ";
      }
      argsDefCode2 += "arg" + String(numArgs - 1);
      return argsDefCode2;
    }
    function generateBodyPartsCode(argsDefCode2, collectionLength) {
      var funcDefCode2 = "", funcCallCode2 = "";
      for (var i2 = 0; i2 < collectionLength; ++i2) {
        funcDefCode2 += "var f".concat(i2, " = collection[").concat(i2, "];\n");
        funcCallCode2 += "f".concat(i2, "(").concat(argsDefCode2, ")\n");
      }
      return { funcDefCode: funcDefCode2, funcCallCode: funcCallCode2 };
    }
    function generateBodyPartsVariadicCode(collectionLength) {
      var funcDefCode2 = "", funcCallCode2 = "";
      for (var i2 = 0; i2 < collectionLength; ++i2) {
        funcDefCode2 += "var f".concat(i2, " = collection[").concat(i2, "];\n");
        funcCallCode2 += "f".concat(i2, ".apply(undefined, arguments)\n");
      }
      return { funcDefCode: funcDefCode2, funcCallCode: funcCallCode2 };
    }
    function bakeCollection(collection, fixedArgsNum) {
      if (collection.length === 0)
        return exports.BAKED_EMPTY_FUNC;
      else if (collection.length === 1)
        return collection[0];
      var funcFactoryCode;
      if (collection.length < FORLOOP_FALLBACK) {
        var argsDefCode = generateArgsDefCode(fixedArgsNum);
        var _a = generateBodyPartsCode(argsDefCode, collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
        funcFactoryCode = "(function(collection) {\n            ".concat(funcDefCode, "\n            collection = undefined;\n            return (function(").concat(argsDefCode, ") {\n                ").concat(funcCallCode, "\n            });\n        })");
      } else {
        var argsDefCode = generateArgsDefCode(fixedArgsNum);
        if (collection.length % 10 === 0) {
          funcFactoryCode = "(function(collection) {\n                return (function(".concat(argsDefCode, ") {\n                    for (var i = 0; i < collection.length; i += 10) {\n                        collection[i](").concat(argsDefCode, ");\n                        collection[i+1](").concat(argsDefCode, ");\n                        collection[i+2](").concat(argsDefCode, ");\n                        collection[i+3](").concat(argsDefCode, ");\n                        collection[i+4](").concat(argsDefCode, ");\n                        collection[i+5](").concat(argsDefCode, ");\n                        collection[i+6](").concat(argsDefCode, ");\n                        collection[i+7](").concat(argsDefCode, ");\n                        collection[i+8](").concat(argsDefCode, ");\n                        collection[i+9](").concat(argsDefCode, ");\n                    }\n                });\n            })");
        } else if (collection.length % 4 === 0) {
          funcFactoryCode = "(function(collection) {\n                return (function(".concat(argsDefCode, ") {\n                    for (var i = 0; i < collection.length; i += 4) {\n                        collection[i](").concat(argsDefCode, ");\n                        collection[i+1](").concat(argsDefCode, ");\n                        collection[i+2](").concat(argsDefCode, ");\n                        collection[i+3](").concat(argsDefCode, ");\n                    }\n                });\n            })");
        } else if (collection.length % 3 === 0) {
          funcFactoryCode = "(function(collection) {\n                return (function(".concat(argsDefCode, ") {\n                    for (var i = 0; i < collection.length; i += 3) {\n                        collection[i](").concat(argsDefCode, ");\n                        collection[i+1](").concat(argsDefCode, ");\n                        collection[i+2](").concat(argsDefCode, ");\n                    }\n                });\n            })");
        } else {
          funcFactoryCode = "(function(collection) {\n                return (function(".concat(argsDefCode, ") {\n                    for (var i = 0; i < collection.length; ++i) {\n                        collection[i](").concat(argsDefCode, ");\n                    }\n                });\n            })");
        }
      }
      {
        var bakeCollection_1 = void 0;
        var fixedArgsNum_1 = void 0;
        var bakeCollectionVariadic_1 = void 0;
        var bakeCollectionAwait_1 = void 0;
        var funcFactory = eval(funcFactoryCode);
        return funcFactory(collection);
      }
    }
    exports.bakeCollection = bakeCollection;
    function bakeCollectionAwait(collection, fixedArgsNum) {
      if (collection.length === 0)
        return exports.BAKED_EMPTY_FUNC;
      else if (collection.length === 1)
        return collection[0];
      var funcFactoryCode;
      if (collection.length < FORLOOP_FALLBACK) {
        var argsDefCode = generateArgsDefCode(fixedArgsNum);
        var _a = generateBodyPartsCode(argsDefCode, collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
        funcFactoryCode = "(function(collection) {\n            ".concat(funcDefCode, "\n            collection = undefined;\n            return (function(").concat(argsDefCode, ") {\n                return Promise.all([ ").concat(funcCallCode, " ]);\n            });\n        })");
      } else {
        var argsDefCode = generateArgsDefCode(fixedArgsNum);
        funcFactoryCode = "(function(collection) {\n            return (function(".concat(argsDefCode, ") {\n                var promises = Array(collection.length);\n                for (var i = 0; i < collection.length; ++i) {\n                    promises[i] = collection[i](").concat(argsDefCode, ");\n                }\n                return Promise.all(promises);\n            });\n        })");
      }
      {
        var bakeCollection_2 = void 0;
        var fixedArgsNum_2 = void 0;
        var bakeCollectionVariadic_2 = void 0;
        var bakeCollectionAwait_2 = void 0;
        var funcFactory = eval(funcFactoryCode);
        return funcFactory(collection);
      }
    }
    exports.bakeCollectionAwait = bakeCollectionAwait;
    function bakeCollectionVariadic(collection) {
      if (collection.length === 0)
        return exports.BAKED_EMPTY_FUNC;
      else if (collection.length === 1)
        return collection[0];
      var funcFactoryCode;
      if (collection.length < FORLOOP_FALLBACK) {
        var _a = generateBodyPartsVariadicCode(collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
        funcFactoryCode = "(function(collection) {\n            ".concat(funcDefCode, "\n            collection = undefined;\n            return (function() {\n                ").concat(funcCallCode, "\n            });\n        })");
      } else {
        funcFactoryCode = "(function(collection) {\n            return (function() {\n                for (var i = 0; i < collection.length; ++i) {\n                    collection[i].apply(undefined, arguments);\n                }\n            });\n        })";
      }
      {
        var bakeCollection_3 = void 0;
        var fixedArgsNum = void 0;
        var bakeCollectionVariadic_3 = void 0;
        var bakeCollectionAwait_3 = void 0;
        var funcFactory = eval(funcFactoryCode);
        return funcFactory(collection);
      }
    }
    exports.bakeCollectionVariadic = bakeCollectionVariadic;
  }
});

// ../node_modules/tseep/lib/task-collection/task-collection.js
var require_task_collection = __commonJS({
  "../node_modules/tseep/lib/task-collection/task-collection.js"(exports2) {
    "use strict";
    var __spreadArray = exports2 && exports2.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i2 = 0, l = from.length, ar; i2 < l; i2++) {
        if (ar || !(i2 in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i2);
          ar[i2] = from[i2];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TaskCollection = void 0;
    var utils_1 = require_utils();
    var bake_collection_1 = require_bake_collection();
    function push_norebuild(a, b) {
      var len = this.length;
      if (len > 1) {
        if (b) {
          var _a2;
          (_a2 = this._tasks).push.apply(_a2, arguments);
          this.length += arguments.length;
        } else {
          this._tasks.push(a);
          this.length++;
        }
      } else {
        if (b) {
          if (len === 1) {
            var newAr = Array(1 + arguments.length);
            newAr.push(newAr);
            newAr.push.apply(newAr, arguments);
            this._tasks = newAr;
          } else {
            var newAr = Array(arguments.length);
            newAr.push.apply(newAr, arguments);
            this._tasks = newAr;
          }
          this.length += arguments.length;
        } else {
          if (len === 1)
            this._tasks = [this._tasks, a];
          else
            this._tasks = a;
          this.length++;
        }
      }
    }
    function push_rebuild(a, b) {
      var len = this.length;
      if (len > 1) {
        if (b) {
          var _a2;
          (_a2 = this._tasks).push.apply(_a2, arguments);
          this.length += arguments.length;
        } else {
          this._tasks.push(a);
          this.length++;
        }
      } else {
        if (b) {
          if (len === 1) {
            var newAr = Array(1 + arguments.length);
            newAr.push(newAr);
            newAr.push.apply(newAr, arguments);
            this._tasks = newAr;
          } else {
            var newAr = Array(arguments.length);
            newAr.push.apply(newAr, arguments);
            this._tasks = newAr;
          }
          this.length += arguments.length;
        } else {
          if (len === 1)
            this._tasks = [this._tasks, a];
          else
            this._tasks = a;
          this.length++;
        }
      }
      if (this.firstEmitBuildStrategy)
        this.call = rebuild_on_first_call;
      else
        this.rebuild();
    }
    function removeLast_norebuild(a) {
      if (this.length === 0)
        return;
      if (this.length === 1) {
        if (this._tasks === a) {
          this.length = 0;
        }
      } else {
        (0, utils_1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a));
        if (this._tasks.length === 1) {
          this._tasks = this._tasks[0];
          this.length = 1;
        } else
          this.length = this._tasks.length;
      }
    }
    function removeLast_rebuild(a) {
      if (this.length === 0)
        return;
      if (this.length === 1) {
        if (this._tasks === a) {
          this.length = 0;
        }
        if (this.firstEmitBuildStrategy) {
          this.call = bake_collection_1.BAKED_EMPTY_FUNC;
          return;
        } else {
          this.rebuild();
          return;
        }
      } else {
        (0, utils_1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a));
        if (this._tasks.length === 1) {
          this._tasks = this._tasks[0];
          this.length = 1;
        } else
          this.length = this._tasks.length;
      }
      if (this.firstEmitBuildStrategy)
        this.call = rebuild_on_first_call;
      else
        this.rebuild();
    }
    function insert_norebuild(index) {
      var _b;
      var func = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        func[_i - 1] = arguments[_i];
      }
      if (this.length === 0) {
        this._tasks = func;
        this.length = 1;
      } else if (this.length === 1) {
        func.unshift(this._tasks);
        this._tasks = func;
        this.length = this._tasks.length;
      } else {
        (_b = this._tasks).splice.apply(_b, __spreadArray([index, 0], func, false));
        this.length = this._tasks.length;
      }
    }
    function insert_rebuild(index) {
      var _b;
      var func = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        func[_i - 1] = arguments[_i];
      }
      if (this.length === 0) {
        this._tasks = func;
        this.length = 1;
      } else if (this.length === 1) {
        func.unshift(this._tasks);
        this._tasks = func;
        this.length = this._tasks.length;
      } else {
        (_b = this._tasks).splice.apply(_b, __spreadArray([index, 0], func, false));
        this.length = this._tasks.length;
      }
      if (this.firstEmitBuildStrategy)
        this.call = rebuild_on_first_call;
      else
        this.rebuild();
    }
    function rebuild_noawait() {
      if (this.length === 0)
        this.call = bake_collection_1.BAKED_EMPTY_FUNC;
      else if (this.length === 1)
        this.call = this._tasks;
      else
        this.call = (0, bake_collection_1.bakeCollection)(this._tasks, this.argsNum);
    }
    function rebuild_await() {
      if (this.length === 0)
        this.call = bake_collection_1.BAKED_EMPTY_FUNC;
      else if (this.length === 1)
        this.call = this._tasks;
      else
        this.call = (0, bake_collection_1.bakeCollectionAwait)(this._tasks, this.argsNum);
    }
    function rebuild_on_first_call() {
      this.rebuild();
      this.call.apply(void 0, arguments);
    }
    var TaskCollection = (
      /** @class */
      /* @__PURE__ */ (function() {
        function TaskCollection2(argsNum, autoRebuild, initialTasks, awaitTasks) {
          if (autoRebuild === void 0) {
            autoRebuild = true;
          }
          if (initialTasks === void 0) {
            initialTasks = null;
          }
          if (awaitTasks === void 0) {
            awaitTasks = false;
          }
          this.awaitTasks = awaitTasks;
          this.call = bake_collection_1.BAKED_EMPTY_FUNC;
          this.argsNum = argsNum;
          this.firstEmitBuildStrategy = true;
          if (awaitTasks)
            this.rebuild = rebuild_await.bind(this);
          else
            this.rebuild = rebuild_noawait.bind(this);
          this.setAutoRebuild(autoRebuild);
          if (initialTasks) {
            if (typeof initialTasks === "function") {
              this._tasks = initialTasks;
              this.length = 1;
            } else {
              this._tasks = initialTasks;
              this.length = initialTasks.length;
            }
          } else {
            this._tasks = null;
            this.length = 0;
          }
          if (autoRebuild)
            this.rebuild();
        }
        return TaskCollection2;
      })()
    );
    exports2.TaskCollection = TaskCollection;
    function fastClear() {
      this._tasks = null;
      this.length = 0;
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
    }
    function clear() {
      this._tasks = null;
      this.length = 0;
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
    }
    function growArgsNum(argsNum) {
      if (this.argsNum < argsNum) {
        this.argsNum = argsNum;
        if (this.firstEmitBuildStrategy)
          this.call = rebuild_on_first_call;
        else
          this.rebuild();
      }
    }
    function setAutoRebuild(newVal) {
      if (newVal) {
        this.push = push_rebuild.bind(this);
        this.insert = insert_rebuild.bind(this);
        this.removeLast = removeLast_rebuild.bind(this);
      } else {
        this.push = push_norebuild.bind(this);
        this.insert = insert_norebuild.bind(this);
        this.removeLast = removeLast_norebuild.bind(this);
      }
    }
    function tasksAsArray() {
      if (this.length === 0)
        return [];
      if (this.length === 1)
        return [this._tasks];
      return this._tasks;
    }
    function setTasks(tasks) {
      if (tasks.length === 0) {
        this.length = 0;
        this.call = bake_collection_1.BAKED_EMPTY_FUNC;
      } else if (tasks.length === 1) {
        this.length = 1;
        this.call = tasks[0];
        this._tasks = tasks[0];
      } else {
        this.length = tasks.length;
        this._tasks = tasks;
        if (this.firstEmitBuildStrategy)
          this.call = rebuild_on_first_call;
        else
          this.rebuild();
      }
    }
    TaskCollection.prototype.fastClear = fastClear;
    TaskCollection.prototype.clear = clear;
    TaskCollection.prototype.growArgsNum = growArgsNum;
    TaskCollection.prototype.setAutoRebuild = setAutoRebuild;
    TaskCollection.prototype.tasksAsArray = tasksAsArray;
    TaskCollection.prototype.setTasks = setTasks;
  }
});

// ../node_modules/tseep/lib/task-collection/index.js
var require_task_collection2 = __commonJS({
  "../node_modules/tseep/lib/task-collection/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_task_collection(), exports2);
  }
});

// ../node_modules/tseep/lib/utils.js
var require_utils2 = __commonJS({
  "../node_modules/tseep/lib/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nullObj = void 0;
    function nullObj() {
      var x = {};
      x.__proto__ = null;
      return x;
    }
    exports2.nullObj = nullObj;
  }
});

// ../node_modules/tseep/lib/ee.js
var require_ee = __commonJS({
  "../node_modules/tseep/lib/ee.js"(exports2) {
    "use strict";
    var __spreadArray = exports2 && exports2.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i2 = 0, l = from.length, ar; i2 < l; i2++) {
        if (ar || !(i2 in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i2);
          ar[i2] = from[i2];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventEmitter = void 0;
    var task_collection_1 = require_task_collection2();
    var utils_1 = require_utils();
    var utils_2 = require_utils2();
    function emit(event, a, b, c, d4, e) {
      var ev = this.events[event];
      if (ev) {
        if (ev.length === 0)
          return false;
        if (ev.argsNum < 6) {
          ev.call(a, b, c, d4, e);
        } else {
          var arr = new Array(ev.argsNum);
          for (var i2 = 0, len = arr.length; i2 < len; ++i2) {
            arr[i2] = arguments[i2 + 1];
          }
          ev.call.apply(void 0, arr);
        }
        return true;
      }
      return false;
    }
    function emitHasOnce(event, a, b, c, d4, e) {
      var ev = this.events[event];
      var argsArr;
      if (ev !== void 0) {
        if (ev.length === 0)
          return false;
        if (ev.argsNum < 6) {
          ev.call(a, b, c, d4, e);
        } else {
          argsArr = new Array(ev.argsNum);
          for (var i2 = 0, len = argsArr.length; i2 < len; ++i2) {
            argsArr[i2] = arguments[i2 + 1];
          }
          ev.call.apply(void 0, argsArr);
        }
      }
      var oev = this.onceEvents[event];
      if (oev) {
        if (typeof oev === "function") {
          this.onceEvents[event] = void 0;
          if (arguments.length < 6) {
            oev(a, b, c, d4, e);
          } else {
            if (argsArr === void 0) {
              argsArr = new Array(arguments.length - 1);
              for (var i2 = 0, len = argsArr.length; i2 < len; ++i2) {
                argsArr[i2] = arguments[i2 + 1];
              }
            }
            oev.apply(void 0, argsArr);
          }
        } else {
          var fncs = oev;
          this.onceEvents[event] = void 0;
          if (arguments.length < 6) {
            for (var i2 = 0; i2 < fncs.length; ++i2) {
              fncs[i2](a, b, c, d4, e);
            }
          } else {
            if (argsArr === void 0) {
              argsArr = new Array(arguments.length - 1);
              for (var i2 = 0, len = argsArr.length; i2 < len; ++i2) {
                argsArr[i2] = arguments[i2 + 1];
              }
            }
            for (var i2 = 0; i2 < fncs.length; ++i2) {
              fncs[i2].apply(void 0, argsArr);
            }
          }
        }
        return true;
      }
      return ev !== void 0;
    }
    var EventEmitter10 = (
      /** @class */
      (function() {
        function EventEmitter11() {
          this.events = (0, utils_2.nullObj)();
          this.onceEvents = (0, utils_2.nullObj)();
          this._symbolKeys = /* @__PURE__ */ new Set();
          this.maxListeners = Infinity;
        }
        Object.defineProperty(EventEmitter11.prototype, "_eventsCount", {
          get: function() {
            return this.eventNames().length;
          },
          enumerable: false,
          configurable: true
        });
        return EventEmitter11;
      })()
    );
    exports2.EventEmitter = EventEmitter10;
    function once(event, listener) {
      if (this.emit === emit) {
        this.emit = emitHasOnce;
      }
      switch (typeof this.onceEvents[event]) {
        case "undefined":
          this.onceEvents[event] = listener;
          if (typeof event === "symbol")
            this._symbolKeys.add(event);
          break;
        case "function":
          this.onceEvents[event] = [this.onceEvents[event], listener];
          break;
        case "object":
          this.onceEvents[event].push(listener);
      }
      return this;
    }
    function addListener(event, listener, argsNum) {
      if (argsNum === void 0) {
        argsNum = listener.length;
      }
      if (typeof listener !== "function")
        throw new TypeError("The listener must be a function");
      var evtmap = this.events[event];
      if (!evtmap) {
        this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false);
        if (typeof event === "symbol")
          this._symbolKeys.add(event);
      } else {
        evtmap.push(listener);
        evtmap.growArgsNum(argsNum);
        if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length)
          console.warn('Maximum event listeners for "'.concat(String(event), '" event!'));
      }
      return this;
    }
    function removeListener(event, listener) {
      var evt = this.events[event];
      if (evt) {
        evt.removeLast(listener);
      }
      var evto = this.onceEvents[event];
      if (evto) {
        if (typeof evto === "function") {
          this.onceEvents[event] = void 0;
        } else if (typeof evto === "object") {
          if (evto.length === 1 && evto[0] === listener) {
            this.onceEvents[event] = void 0;
          } else {
            (0, utils_1._fast_remove_single)(evto, evto.lastIndexOf(listener));
          }
        }
      }
      return this;
    }
    function addListenerBound(event, listener, bindTo, argsNum) {
      if (bindTo === void 0) {
        bindTo = this;
      }
      if (argsNum === void 0) {
        argsNum = listener.length;
      }
      if (!this.boundFuncs)
        this.boundFuncs = /* @__PURE__ */ new Map();
      var bound = listener.bind(bindTo);
      this.boundFuncs.set(listener, bound);
      return this.addListener(event, bound, argsNum);
    }
    function removeListenerBound(event, listener) {
      var _a2, _b;
      var bound = (_a2 = this.boundFuncs) === null || _a2 === void 0 ? void 0 : _a2.get(listener);
      (_b = this.boundFuncs) === null || _b === void 0 ? void 0 : _b.delete(listener);
      return this.removeListener(event, bound);
    }
    function hasListeners(event) {
      return this.events[event] && !!this.events[event].length;
    }
    function prependListener(event, listener, argsNum) {
      if (argsNum === void 0) {
        argsNum = listener.length;
      }
      if (typeof listener !== "function")
        throw new TypeError("The listener must be a function");
      var evtmap = this.events[event];
      if (!evtmap || !(evtmap instanceof task_collection_1.TaskCollection)) {
        evtmap = this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false);
        if (typeof event === "symbol")
          this._symbolKeys.add(event);
      } else {
        evtmap.insert(0, listener);
        evtmap.growArgsNum(argsNum);
        if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length)
          console.warn('Maximum event listeners for "'.concat(String(event), '" event!'));
      }
      return this;
    }
    function prependOnceListener(event, listener) {
      if (this.emit === emit) {
        this.emit = emitHasOnce;
      }
      var evtmap = this.onceEvents[event];
      if (!evtmap) {
        this.onceEvents[event] = [listener];
        if (typeof event === "symbol")
          this._symbolKeys.add(event);
      } else if (typeof evtmap !== "object") {
        this.onceEvents[event] = [listener, evtmap];
        if (typeof event === "symbol")
          this._symbolKeys.add(event);
      } else {
        evtmap.unshift(listener);
        if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length) {
          console.warn('Maximum event listeners for "'.concat(String(event), '" once event!'));
        }
      }
      return this;
    }
    function removeAllListeners(event) {
      if (event === void 0) {
        this.events = (0, utils_2.nullObj)();
        this.onceEvents = (0, utils_2.nullObj)();
        this._symbolKeys = /* @__PURE__ */ new Set();
      } else {
        this.events[event] = void 0;
        this.onceEvents[event] = void 0;
        if (typeof event === "symbol")
          this._symbolKeys.delete(event);
      }
      return this;
    }
    function setMaxListeners(n) {
      this.maxListeners = n;
      return this;
    }
    function getMaxListeners() {
      return this.maxListeners;
    }
    function listeners(event) {
      if (this.emit === emit)
        return this.events[event] ? this.events[event].tasksAsArray().slice() : [];
      else {
        if (this.events[event] && this.onceEvents[event]) {
          return __spreadArray(__spreadArray([], this.events[event].tasksAsArray(), true), typeof this.onceEvents[event] === "function" ? [this.onceEvents[event]] : this.onceEvents[event], true);
        } else if (this.events[event])
          return this.events[event].tasksAsArray();
        else if (this.onceEvents[event])
          return typeof this.onceEvents[event] === "function" ? [this.onceEvents[event]] : this.onceEvents[event];
        else
          return [];
      }
    }
    function eventNames() {
      var _this = this;
      if (this.emit === emit) {
        var keys = Object.keys(this.events);
        return __spreadArray(__spreadArray([], keys, true), Array.from(this._symbolKeys), true).filter(function(x) {
          return x in _this.events && _this.events[x] && _this.events[x].length;
        });
      } else {
        var keys = Object.keys(this.events).filter(function(x) {
          return _this.events[x] && _this.events[x].length;
        });
        var keysO = Object.keys(this.onceEvents).filter(function(x) {
          return _this.onceEvents[x] && _this.onceEvents[x].length;
        });
        return __spreadArray(__spreadArray(__spreadArray([], keys, true), keysO, true), Array.from(this._symbolKeys).filter(function(x) {
          return x in _this.events && _this.events[x] && _this.events[x].length || x in _this.onceEvents && _this.onceEvents[x] && _this.onceEvents[x].length;
        }), true);
      }
    }
    function listenerCount(type) {
      if (this.emit === emit)
        return this.events[type] && this.events[type].length || 0;
      else
        return (this.events[type] && this.events[type].length || 0) + (this.onceEvents[type] && this.onceEvents[type].length || 0);
    }
    EventEmitter10.prototype.emit = emit;
    EventEmitter10.prototype.on = addListener;
    EventEmitter10.prototype.once = once;
    EventEmitter10.prototype.addListener = addListener;
    EventEmitter10.prototype.removeListener = removeListener;
    EventEmitter10.prototype.addListenerBound = addListenerBound;
    EventEmitter10.prototype.removeListenerBound = removeListenerBound;
    EventEmitter10.prototype.hasListeners = hasListeners;
    EventEmitter10.prototype.prependListener = prependListener;
    EventEmitter10.prototype.prependOnceListener = prependOnceListener;
    EventEmitter10.prototype.off = removeListener;
    EventEmitter10.prototype.removeAllListeners = removeAllListeners;
    EventEmitter10.prototype.setMaxListeners = setMaxListeners;
    EventEmitter10.prototype.getMaxListeners = getMaxListeners;
    EventEmitter10.prototype.listeners = listeners;
    EventEmitter10.prototype.eventNames = eventNames;
    EventEmitter10.prototype.listenerCount = listenerCount;
  }
});

// ../node_modules/tseep/lib/index.js
var require_lib = __commonJS({
  "../node_modules/tseep/lib/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_types(), exports2);
    __exportStar(require_ee(), exports2);
  }
});

// ../node_modules/ms/index.js
var require_ms = __commonJS({
  "../node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d4 = h * 24;
    var w = d4 * 7;
    var y = d4 * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse4(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse4(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d4;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d4) {
        return Math.round(ms / d4) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d4) {
        return plural(ms, msAbs, d4, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../node_modules/debug/src/common.js
var require_common = __commonJS({
  "../node_modules/debug/src/common.js"(exports2, module2) {
    function setup(env) {
      createDebug6.debug = createDebug6;
      createDebug6.default = createDebug6;
      createDebug6.coerce = coerce;
      createDebug6.disable = disable;
      createDebug6.enable = enable;
      createDebug6.enabled = enabled;
      createDebug6.humanize = require_ms();
      createDebug6.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug6[key] = env[key];
      });
      createDebug6.names = [];
      createDebug6.skips = [];
      createDebug6.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i2 = 0; i2 < namespace.length; i2++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i2);
          hash |= 0;
        }
        return createDebug6.colors[Math.abs(hash) % createDebug6.colors.length];
      }
      createDebug6.selectColor = selectColor;
      function createDebug6(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug9(...args) {
          if (!debug9.enabled) {
            return;
          }
          const self = debug9;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug6.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug6.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug6.formatArgs.call(self, args);
          const logFn = self.log || createDebug6.log;
          logFn.apply(self, args);
        }
        debug9.namespace = namespace;
        debug9.useColors = createDebug6.useColors();
        debug9.color = createDebug6.selectColor(namespace);
        debug9.extend = extend;
        debug9.destroy = createDebug6.destroy;
        Object.defineProperty(debug9, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug6.namespaces) {
              namespacesCache = createDebug6.namespaces;
              enabledCache = createDebug6.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug6.init === "function") {
          createDebug6.init(debug9);
        }
        return debug9;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug6(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug6.save(namespaces);
        createDebug6.namespaces = namespaces;
        createDebug6.names = [];
        createDebug6.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug6.skips.push(ns.slice(1));
          } else {
            createDebug6.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug6.names,
          ...createDebug6.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug6.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug6.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug6.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug6.enable(createDebug6.load());
      return createDebug6;
    }
    module2.exports = setup;
  }
});

// ../node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// ../node_modules/typescript-lru-cache/dist/LRUCacheNode.js
var require_LRUCacheNode = __commonJS({
  "../node_modules/typescript-lru-cache/dist/LRUCacheNode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LRUCacheNode = void 0;
    var LRUCacheNode = class {
      constructor(key, value, options) {
        const { entryExpirationTimeInMS = null, next = null, prev = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, clone, cloneFn } = options !== null && options !== void 0 ? options : {};
        if (typeof entryExpirationTimeInMS === "number" && (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
          throw new Error("entryExpirationTimeInMS must either be null (no expiry) or greater than 0");
        }
        this.clone = clone !== null && clone !== void 0 ? clone : false;
        this.cloneFn = cloneFn !== null && cloneFn !== void 0 ? cloneFn : this.defaultClone;
        this.key = key;
        this.internalValue = this.clone ? this.cloneFn(value) : value;
        this.created = Date.now();
        this.entryExpirationTimeInMS = entryExpirationTimeInMS;
        this.next = next;
        this.prev = prev;
        this.onEntryEvicted = onEntryEvicted;
        this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed;
      }
      get value() {
        return this.clone ? this.cloneFn(this.internalValue) : this.internalValue;
      }
      get isExpired() {
        return typeof this.entryExpirationTimeInMS === "number" && Date.now() - this.created > this.entryExpirationTimeInMS;
      }
      invokeOnEvicted() {
        if (this.onEntryEvicted) {
          const { key, value, isExpired } = this;
          this.onEntryEvicted({ key, value, isExpired });
        }
      }
      invokeOnEntryMarkedAsMostRecentlyUsed() {
        if (this.onEntryMarkedAsMostRecentlyUsed) {
          const { key, value } = this;
          this.onEntryMarkedAsMostRecentlyUsed({ key, value });
        }
      }
      defaultClone(value) {
        if (typeof value === "boolean" || typeof value === "string" || typeof value === "number") {
          return value;
        }
        return JSON.parse(JSON.stringify(value));
      }
    };
    exports2.LRUCacheNode = LRUCacheNode;
  }
});

// ../node_modules/typescript-lru-cache/dist/LRUCache.js
var require_LRUCache = __commonJS({
  "../node_modules/typescript-lru-cache/dist/LRUCache.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LRUCache = void 0;
    var LRUCacheNode_1 = require_LRUCacheNode();
    var LRUCache4 = class {
      /**
       * Creates a new instance of the LRUCache.
       *
       * @param options Additional configuration options for the LRUCache.
       *
       * @example
       * ```typescript
       * // No options.
       * const cache = new LRUCache();
       *
       * // With options.
       * const cache = new LRUCache({
       *  entryExpirationTimeInMS: 10000
       * });
       * ```
       */
      constructor(options) {
        this.lookupTable = /* @__PURE__ */ new Map();
        this.head = null;
        this.tail = null;
        const { maxSize = 25, entryExpirationTimeInMS = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, cloneFn, clone } = options !== null && options !== void 0 ? options : {};
        if (Number.isNaN(maxSize) || maxSize <= 0) {
          throw new Error("maxSize must be greater than 0.");
        }
        if (typeof entryExpirationTimeInMS === "number" && (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
          throw new Error("entryExpirationTimeInMS must either be null (no expiry) or greater than 0");
        }
        this.maxSizeInternal = maxSize;
        this.entryExpirationTimeInMS = entryExpirationTimeInMS;
        this.onEntryEvicted = onEntryEvicted;
        this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed;
        this.clone = clone;
        this.cloneFn = cloneFn;
      }
      /**
       * Returns the number of entries in the LRUCache object.
       * If the cache has entryExpirationTimeInMS set, expired entries will be removed before the size is returned.
       *
       * @returns The number of entries in the cache.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * cache.set('testKey', 'testValue');
       *
       * const size = cache.size;
       *
       * // Will log 1
       * console.log(size);
       * ```
       */
      get size() {
        this.cleanCache();
        return this.lookupTable.size;
      }
      /**
       * Returns the number of entries that can still be added to the LRUCache without evicting existing entries.
       *
       * @returns The number of entries that can still be added without evicting existing entries.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache({ maxSize: 10 });
       *
       * cache.set('testKey', 'testValue');
       *
       * const remainingSize = cache.remainingSize;
       *
       * // Will log 9 due to 9 spots remaining before reaching maxSize of 10.
       * console.log(remainingSize);
       * ```
       */
      get remainingSize() {
        return this.maxSizeInternal - this.size;
      }
      /**
       * Returns the most recently used (newest) entry in the cache.
       * This will not mark the entry as recently used.
       * If the newest node is expired, it will be removed.
       *
       * @returns The most recently used (newest) entry in the cache.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache({ maxSize: 10 });
       *
       * cache.set('testKey', 'testValue');
       *
       * const newest = cache.newest;
       *
       * // Will log testValue
       * console.log(newest.value);
       *
       * // Will log testKey
       * console.log(newest.key);
       * ```
       */
      get newest() {
        if (!this.head) {
          return null;
        }
        if (this.head.isExpired) {
          this.removeNodeFromListAndLookupTable(this.head);
          return this.newest;
        }
        return this.mapNodeToEntry(this.head);
      }
      /**
       * Returns the least recently used (oldest) entry in the cache.
       * This will not mark the entry as recently used.
       * If the oldest node is expired, it will be removed.
       *
       * @returns The least recently used (oldest) entry in the cache.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache({ maxSize: 10 });
       *
       * cache.set('testKey', 'testValue');
       *
       * const oldest = cache.oldest;
       *
       * // Will log testValue
       * console.log(oldest.value);
       *
       * // Will log testKey
       * console.log(oldest.key);
       * ```
       */
      get oldest() {
        if (!this.tail) {
          return null;
        }
        if (this.tail.isExpired) {
          this.removeNodeFromListAndLookupTable(this.tail);
          return this.oldest;
        }
        return this.mapNodeToEntry(this.tail);
      }
      /**
       * Gets or sets the maxSize of the cache.
       * This will evict the least recently used entries if needed to reach new maxSize.
       *
       * @param value The new value for maxSize. Must be greater than 0.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache({ maxSize: 10 });
       *
       * cache.set('testKey', 'testValue');
       *
       * // Will be 10
       * const maxSize = cache.maxSize;
       *
       * // Set new maxSize to 5. If there are more than 5 items in the cache, the least recently used entries will be removed until cache size is 5.
       * cache.maxSize = 5;
       * ```
       */
      get maxSize() {
        return this.maxSizeInternal;
      }
      set maxSize(value) {
        if (Number.isNaN(value) || value <= 0) {
          throw new Error("maxSize must be greater than 0.");
        }
        this.maxSizeInternal = value;
        this.enforceSizeLimit();
      }
      /**
       * Sets the value for the key in the LRUCache object. Returns the LRUCache object.
       * This marks the newly added entry as the most recently used entry.
       * If adding the new entry makes the cache size go above maxSize,
       * this will evict the least recently used entries until size is equal to maxSize.
       *
       * @param key The key of the entry.
       * @param value The value to set for the key.
       * @param entryOptions Additional configuration options for the cache entry.
       *
       * @returns The LRUCache instance.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Set the key key2 to value value2. Pass in optional options.
       * cache.set('key2', 'value2', { entryExpirationTimeInMS: 10 });
       * ```
       */
      set(key, value, entryOptions) {
        const currentNodeForKey = this.lookupTable.get(key);
        if (currentNodeForKey) {
          this.removeNodeFromListAndLookupTable(currentNodeForKey);
        }
        const node = new LRUCacheNode_1.LRUCacheNode(key, value, {
          entryExpirationTimeInMS: this.entryExpirationTimeInMS,
          onEntryEvicted: this.onEntryEvicted,
          onEntryMarkedAsMostRecentlyUsed: this.onEntryMarkedAsMostRecentlyUsed,
          clone: this.clone,
          cloneFn: this.cloneFn,
          ...entryOptions
        });
        this.setNodeAsHead(node);
        this.lookupTable.set(key, node);
        this.enforceSizeLimit();
        return this;
      }
      /**
       * Returns the value associated to the key, or null if there is none or if the entry is expired.
       * If an entry is returned, this marks the returned entry as the most recently used entry.
       *
       * @param key The key of the entry to get.
       *
       * @returns The cached value or null.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Will be 'testValue'. Entry will now be most recently used.
       * const item1 = cache.get('testKey');
       *
       * // Will be null
       * const item2 = cache.get('keyNotInCache');
       * ```
       */
      get(key) {
        const node = this.lookupTable.get(key);
        if (!node) {
          return null;
        }
        if (node.isExpired) {
          this.removeNodeFromListAndLookupTable(node);
          return null;
        }
        this.setNodeAsHead(node);
        return node.value;
      }
      /**
       * Returns the value associated to the key, or null if there is none or if the entry is expired.
       * If an entry is returned, this will not mark the entry as most recently accessed.
       * Useful if a value is needed but the order of the cache should not be changed.
       *
       * @param key The key of the entry to get.
       *
       * @returns The cached value or null.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Will be 'testValue'
       * const item1 = cache.peek('testKey');
       *
       * // Will be null
       * const item2 = cache.peek('keyNotInCache');
       * ```
       */
      peek(key) {
        const node = this.lookupTable.get(key);
        if (!node) {
          return null;
        }
        if (node.isExpired) {
          this.removeNodeFromListAndLookupTable(node);
          return null;
        }
        return node.value;
      }
      /**
       * Deletes the entry for the passed in key.
       *
       * @param key The key of the entry to delete
       *
       * @returns True if an element in the LRUCache object existed and has been removed,
       * or false if the element does not exist.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Will be true
       * const wasDeleted = cache.delete('testKey');
       *
       * // Will be false
       * const wasDeleted2 = cache.delete('keyNotInCache');
       * ```
       */
      delete(key) {
        const node = this.lookupTable.get(key);
        if (!node) {
          return false;
        }
        return this.removeNodeFromListAndLookupTable(node);
      }
      /**
       * Returns a boolean asserting whether a value has been associated to the key in the LRUCache object or not.
       * This does not mark the entry as recently used.
       * If the cache has a key but the entry is expired, it will be removed and false will be returned.
       *
       * @param key The key of the entry to check if exists
       *
       * @returns true if the cache contains the supplied key. False if not.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Will be true
       * const wasDeleted = cache.has('testKey');
       *
       * // Will be false
       * const wasDeleted2 = cache.has('keyNotInCache');
       * ```
       */
      has(key) {
        const node = this.lookupTable.get(key);
        if (!node) {
          return false;
        }
        if (node.isExpired) {
          this.removeNodeFromListAndLookupTable(node);
          return false;
        }
        return true;
      }
      /**
       * Removes all entries in the cache.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // Clear cache.
       * cache.clear();
       * ```
       */
      clear() {
        this.head = null;
        this.tail = null;
        this.lookupTable.clear();
      }
      /**
       * Searches the cache for an entry matching the passed in condition.
       * Expired entries will be skipped (and removed).
       * If multiply entries in the cache match the condition, the most recently used entry will be returned.
       * If an entry is returned, this marks the returned entry as the most recently used entry.
       *
       * @param condition The condition to apply to each entry in the
       *
       * @returns The first cache entry to match the condition. Null if none match.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * // item will be { key: 'testKey', value: 'testValue }
       * const item = cache.find(entry => {
       *   const { key, value } = entry;
       *
       *   if (key === 'testKey' || value === 'something') {
       *     return true;
       *   }
       *
       *   return false;
       * });
       *
       * // item2 will be null
       * const item2 = cache.find(entry => entry.key === 'notInCache');
       * ```
       */
      find(condition) {
        let node = this.head;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          const entry = this.mapNodeToEntry(node);
          if (condition(entry)) {
            this.setNodeAsHead(node);
            return entry;
          }
          node = node.next;
        }
        return null;
      }
      /**
       * Iterates over and applies the callback function to each entry in the cache.
       * Iterates in order from most recently accessed entry to least recently.
       * Expired entries will be skipped (and removed).
       * No entry will be marked as recently used.
       *
       * @param callback the callback function to apply to the entry
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * cache.forEach((key, value, index) => {
       *   // do something with key, value, and/or index
       * });
       * ```
       */
      forEach(callback) {
        let node = this.head;
        let index = 0;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          callback(node.value, node.key, index);
          node = node.next;
          index++;
        }
      }
      /**
       * Creates a Generator which can be used with for ... of ... to iterate over the cache values.
       * Iterates in order from most recently accessed entry to least recently.
       * Expired entries will be skipped (and removed).
       * No entry will be marked as accessed.
       *
       * @returns A Generator for the cache values.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * for (const value of cache.values()) {
       *   // do something with the value
       * }
       * ```
       */
      *values() {
        let node = this.head;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          yield node.value;
          node = node.next;
        }
      }
      /**
       * Creates a Generator which can be used with for ... of ... to iterate over the cache keys.
       * Iterates in order from most recently accessed entry to least recently.
       * Expired entries will be skipped (and removed).
       * No entry will be marked as accessed.
       *
       * @returns A Generator for the cache keys.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * for (const key of cache.keys()) {
       *   // do something with the key
       * }
       * ```
       */
      *keys() {
        let node = this.head;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          yield node.key;
          node = node.next;
        }
      }
      /**
       * Creates a Generator which can be used with for ... of ... to iterate over the cache entries.
       * Iterates in order from most recently accessed entry to least recently.
       * Expired entries will be skipped (and removed).
       * No entry will be marked as accessed.
       *
       * @returns A Generator for the cache entries.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * for (const entry of cache.entries()) {
       *   const { key, value } = entry;
       *   // do something with the entry
       * }
       * ```
       */
      *entries() {
        let node = this.head;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          yield this.mapNodeToEntry(node);
          node = node.next;
        }
      }
      /**
       * Creates a Generator which can be used with for ... of ... to iterate over the cache entries.
       * Iterates in order from most recently accessed entry to least recently.
       * Expired entries will be skipped (and removed).
       * No entry will be marked as accessed.
       *
       * @returns A Generator for the cache entries.
       *
       * @example
       * ```typescript
       * const cache = new LRUCache();
       *
       * // Set the key testKey to value testValue
       * cache.set('testKey', 'testValue');
       *
       * for (const entry of cache) {
       *   const { key, value } = entry;
       *   // do something with the entry
       * }
       * ```
       */
      *[Symbol.iterator]() {
        let node = this.head;
        while (node) {
          if (node.isExpired) {
            const next = node.next;
            this.removeNodeFromListAndLookupTable(node);
            node = next;
            continue;
          }
          yield this.mapNodeToEntry(node);
          node = node.next;
        }
      }
      enforceSizeLimit() {
        let node = this.tail;
        while (node !== null && this.size > this.maxSizeInternal) {
          const prev = node.prev;
          this.removeNodeFromListAndLookupTable(node);
          node = prev;
        }
      }
      mapNodeToEntry({ key, value }) {
        return {
          key,
          value
        };
      }
      setNodeAsHead(node) {
        this.removeNodeFromList(node);
        if (!this.head) {
          this.head = node;
          this.tail = node;
        } else {
          node.next = this.head;
          this.head.prev = node;
          this.head = node;
        }
        node.invokeOnEntryMarkedAsMostRecentlyUsed();
      }
      removeNodeFromList(node) {
        if (node.prev !== null) {
          node.prev.next = node.next;
        }
        if (node.next !== null) {
          node.next.prev = node.prev;
        }
        if (this.head === node) {
          this.head = node.next;
        }
        if (this.tail === node) {
          this.tail = node.prev;
        }
        node.next = null;
        node.prev = null;
      }
      removeNodeFromListAndLookupTable(node) {
        node.invokeOnEvicted();
        this.removeNodeFromList(node);
        return this.lookupTable.delete(node.key);
      }
      cleanCache() {
        if (!this.entryExpirationTimeInMS) {
          return;
        }
        const expiredNodes = [];
        for (const node of this.lookupTable.values()) {
          if (node.isExpired) {
            expiredNodes.push(node);
          }
        }
        expiredNodes.forEach((node) => this.removeNodeFromListAndLookupTable(node));
      }
    };
    exports2.LRUCache = LRUCache4;
  }
});

// ../node_modules/typescript-lru-cache/dist/index.js
var require_dist = __commonJS({
  "../node_modules/typescript-lru-cache/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_LRUCache(), exports2);
  }
});

// ../node_modules/light-bolt11-decoder/node_modules/@scure/base/lib/index.js
var require_lib2 = __commonJS({
  "../node_modules/light-bolt11-decoder/node_modules/@scure/base/lib/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bytes = exports2.stringToBytes = exports2.str = exports2.bytesToString = exports2.hex = exports2.utf8 = exports2.bech32m = exports2.bech32 = exports2.base58check = exports2.base58xmr = exports2.base58xrp = exports2.base58flickr = exports2.base58 = exports2.base64url = exports2.base64 = exports2.base32crockford = exports2.base32hex = exports2.base32 = exports2.base16 = exports2.utils = exports2.assertNumber = void 0;
    function assertNumber(n) {
      if (!Number.isSafeInteger(n))
        throw new Error(`Wrong integer: ${n}`);
    }
    exports2.assertNumber = assertNumber;
    function chain3(...args) {
      const wrap = (a, b) => (c) => a(b(c));
      const encode2 = Array.from(args).reverse().reduce((acc, i2) => acc ? wrap(acc, i2.encode) : i2.encode, void 0);
      const decode4 = args.reduce((acc, i2) => acc ? wrap(acc, i2.decode) : i2.decode, void 0);
      return { encode: encode2, decode: decode4 };
    }
    function alphabet3(alphabet4) {
      return {
        encode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("alphabet.encode input should be an array of numbers");
          return digits.map((i2) => {
            assertNumber(i2);
            if (i2 < 0 || i2 >= alphabet4.length)
              throw new Error(`Digit index outside alphabet: ${i2} (alphabet: ${alphabet4.length})`);
            return alphabet4[i2];
          });
        },
        decode: (input) => {
          if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
            throw new Error("alphabet.decode input should be array of strings");
          return input.map((letter) => {
            if (typeof letter !== "string")
              throw new Error(`alphabet.decode: not string element=${letter}`);
            const index = alphabet4.indexOf(letter);
            if (index === -1)
              throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet4}`);
            return index;
          });
        }
      };
    }
    function join3(separator = "") {
      if (typeof separator !== "string")
        throw new Error("join separator should be string");
      return {
        encode: (from) => {
          if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
            throw new Error("join.encode input should be array of strings");
          for (let i2 of from)
            if (typeof i2 !== "string")
              throw new Error(`join.encode: non-string input=${i2}`);
          return from.join(separator);
        },
        decode: (to) => {
          if (typeof to !== "string")
            throw new Error("join.decode input should be string");
          return to.split(separator);
        }
      };
    }
    function padding2(bits, chr = "=") {
      assertNumber(bits);
      if (typeof chr !== "string")
        throw new Error("padding chr should be string");
      return {
        encode(data) {
          if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
            throw new Error("padding.encode input should be array of strings");
          for (let i2 of data)
            if (typeof i2 !== "string")
              throw new Error(`padding.encode: non-string input=${i2}`);
          while (data.length * bits % 8)
            data.push(chr);
          return data;
        },
        decode(input) {
          if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
            throw new Error("padding.encode input should be array of strings");
          for (let i2 of input)
            if (typeof i2 !== "string")
              throw new Error(`padding.decode: non-string input=${i2}`);
          let end = input.length;
          if (end * bits % 8)
            throw new Error("Invalid padding: string should have whole number of bytes");
          for (; end > 0 && input[end - 1] === chr; end--) {
            if (!((end - 1) * bits % 8))
              throw new Error("Invalid padding: string has too much padding");
          }
          return input.slice(0, end);
        }
      };
    }
    function normalize2(fn) {
      if (typeof fn !== "function")
        throw new Error("normalize fn should be function");
      return { encode: (from) => from, decode: (to) => fn(to) };
    }
    function convertRadix(data, from, to) {
      if (from < 2)
        throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
      if (to < 2)
        throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
      if (!Array.isArray(data))
        throw new Error("convertRadix: data should be array");
      if (!data.length)
        return [];
      let pos = 0;
      const res = [];
      const digits = Array.from(data);
      digits.forEach((d4) => {
        assertNumber(d4);
        if (d4 < 0 || d4 >= from)
          throw new Error(`Wrong integer: ${d4}`);
      });
      while (true) {
        let carry = 0;
        let done = true;
        for (let i2 = pos; i2 < digits.length; i2++) {
          const digit = digits[i2];
          const digitBase = from * carry + digit;
          if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
            throw new Error("convertRadix: carry overflow");
          }
          carry = digitBase % to;
          digits[i2] = Math.floor(digitBase / to);
          if (!Number.isSafeInteger(digits[i2]) || digits[i2] * to + carry !== digitBase)
            throw new Error("convertRadix: carry overflow");
          if (!done)
            continue;
          else if (!digits[i2])
            pos = i2;
          else
            done = false;
        }
        res.push(carry);
        if (done)
          break;
      }
      for (let i2 = 0; i2 < data.length - 1 && data[i2] === 0; i2++)
        res.push(0);
      return res.reverse();
    }
    var gcd3 = (a, b) => !b ? a : gcd3(b, a % b);
    var radix2carry3 = (from, to) => from + (to - gcd3(from, to));
    function convertRadix23(data, from, to, padding3) {
      if (!Array.isArray(data))
        throw new Error("convertRadix2: data should be array");
      if (from <= 0 || from > 32)
        throw new Error(`convertRadix2: wrong from=${from}`);
      if (to <= 0 || to > 32)
        throw new Error(`convertRadix2: wrong to=${to}`);
      if (radix2carry3(from, to) > 32) {
        throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry3(from, to)}`);
      }
      let carry = 0;
      let pos = 0;
      const mask = 2 ** to - 1;
      const res = [];
      for (const n of data) {
        assertNumber(n);
        if (n >= 2 ** from)
          throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
        carry = carry << from | n;
        if (pos + from > 32)
          throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
        pos += from;
        for (; pos >= to; pos -= to)
          res.push((carry >> pos - to & mask) >>> 0);
        carry &= 2 ** pos - 1;
      }
      carry = carry << to - pos & mask;
      if (!padding3 && pos >= from)
        throw new Error("Excess padding");
      if (!padding3 && carry)
        throw new Error(`Non-zero padding: ${carry}`);
      if (padding3 && pos > 0)
        res.push(carry >>> 0);
      return res;
    }
    function radix(num3) {
      assertNumber(num3);
      return {
        encode: (bytes) => {
          if (!(bytes instanceof Uint8Array))
            throw new Error("radix.encode input should be Uint8Array");
          return convertRadix(Array.from(bytes), 2 ** 8, num3);
        },
        decode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("radix.decode input should be array of strings");
          return Uint8Array.from(convertRadix(digits, num3, 2 ** 8));
        }
      };
    }
    function radix23(bits, revPadding = false) {
      assertNumber(bits);
      if (bits <= 0 || bits > 32)
        throw new Error("radix2: bits should be in (0..32]");
      if (radix2carry3(8, bits) > 32 || radix2carry3(bits, 8) > 32)
        throw new Error("radix2: carry overflow");
      return {
        encode: (bytes) => {
          if (!(bytes instanceof Uint8Array))
            throw new Error("radix2.encode input should be Uint8Array");
          return convertRadix23(Array.from(bytes), 8, bits, !revPadding);
        },
        decode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("radix2.decode input should be array of strings");
          return Uint8Array.from(convertRadix23(digits, bits, 8, revPadding));
        }
      };
    }
    function unsafeWrapper3(fn) {
      if (typeof fn !== "function")
        throw new Error("unsafeWrapper fn should be function");
      return function(...args) {
        try {
          return fn.apply(null, args);
        } catch (e) {
        }
      };
    }
    function checksum(len, fn) {
      assertNumber(len);
      if (typeof fn !== "function")
        throw new Error("checksum fn should be function");
      return {
        encode(data) {
          if (!(data instanceof Uint8Array))
            throw new Error("checksum.encode: input should be Uint8Array");
          const checksum2 = fn(data).slice(0, len);
          const res = new Uint8Array(data.length + len);
          res.set(data);
          res.set(checksum2, data.length);
          return res;
        },
        decode(data) {
          if (!(data instanceof Uint8Array))
            throw new Error("checksum.decode: input should be Uint8Array");
          const payload = data.slice(0, -len);
          const newChecksum = fn(payload).slice(0, len);
          const oldChecksum = data.slice(-len);
          for (let i2 = 0; i2 < len; i2++)
            if (newChecksum[i2] !== oldChecksum[i2])
              throw new Error("Invalid checksum");
          return payload;
        }
      };
    }
    exports2.utils = { alphabet: alphabet3, chain: chain3, checksum, radix, radix2: radix23, join: join3, padding: padding2 };
    exports2.base16 = chain3(radix23(4), alphabet3("0123456789ABCDEF"), join3(""));
    exports2.base32 = chain3(radix23(5), alphabet3("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding2(5), join3(""));
    exports2.base32hex = chain3(radix23(5), alphabet3("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding2(5), join3(""));
    exports2.base32crockford = chain3(radix23(5), alphabet3("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join3(""), normalize2((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
    exports2.base64 = chain3(radix23(6), alphabet3("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding2(6), join3(""));
    exports2.base64url = chain3(radix23(6), alphabet3("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding2(6), join3(""));
    var genBase58 = (abc) => chain3(radix(58), alphabet3(abc), join3(""));
    exports2.base58 = genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    exports2.base58flickr = genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
    exports2.base58xrp = genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
    var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
    exports2.base58xmr = {
      encode(data) {
        let res = "";
        for (let i2 = 0; i2 < data.length; i2 += 8) {
          const block = data.subarray(i2, i2 + 8);
          res += exports2.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
        }
        return res;
      },
      decode(str) {
        let res = [];
        for (let i2 = 0; i2 < str.length; i2 += 11) {
          const slice = str.slice(i2, i2 + 11);
          const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
          const block = exports2.base58.decode(slice);
          for (let j = 0; j < block.length - blockLen; j++) {
            if (block[j] !== 0)
              throw new Error("base58xmr: wrong padding");
          }
          res = res.concat(Array.from(block.slice(block.length - blockLen)));
        }
        return Uint8Array.from(res);
      }
    };
    var base58check = (sha2564) => chain3(checksum(4, (data) => sha2564(sha2564(data))), exports2.base58);
    exports2.base58check = base58check;
    var BECH_ALPHABET3 = chain3(alphabet3("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join3(""));
    var POLYMOD_GENERATORS3 = [996825010, 642813549, 513874426, 1027748829, 705979059];
    function bech32Polymod3(pre) {
      const b = pre >> 25;
      let chk = (pre & 33554431) << 5;
      for (let i2 = 0; i2 < POLYMOD_GENERATORS3.length; i2++) {
        if ((b >> i2 & 1) === 1)
          chk ^= POLYMOD_GENERATORS3[i2];
      }
      return chk;
    }
    function bechChecksum3(prefix, words, encodingConst = 1) {
      const len = prefix.length;
      let chk = 1;
      for (let i2 = 0; i2 < len; i2++) {
        const c = prefix.charCodeAt(i2);
        if (c < 33 || c > 126)
          throw new Error(`Invalid prefix (${prefix})`);
        chk = bech32Polymod3(chk) ^ c >> 5;
      }
      chk = bech32Polymod3(chk);
      for (let i2 = 0; i2 < len; i2++)
        chk = bech32Polymod3(chk) ^ prefix.charCodeAt(i2) & 31;
      for (let v of words)
        chk = bech32Polymod3(chk) ^ v;
      for (let i2 = 0; i2 < 6; i2++)
        chk = bech32Polymod3(chk);
      chk ^= encodingConst;
      return BECH_ALPHABET3.encode(convertRadix23([chk % 2 ** 30], 30, 5, false));
    }
    function genBech323(encoding) {
      const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
      const _words = radix23(5);
      const fromWords = _words.decode;
      const toWords = _words.encode;
      const fromWordsUnsafe = unsafeWrapper3(fromWords);
      function encode2(prefix, words, limit = 90) {
        if (typeof prefix !== "string")
          throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
        if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
          throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
        const actualLength = prefix.length + 7 + words.length;
        if (limit !== false && actualLength > limit)
          throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
        prefix = prefix.toLowerCase();
        return `${prefix}1${BECH_ALPHABET3.encode(words)}${bechChecksum3(prefix, words, ENCODING_CONST)}`;
      }
      function decode4(str, limit = 90) {
        if (typeof str !== "string")
          throw new Error(`bech32.decode input should be string, not ${typeof str}`);
        if (str.length < 8 || limit !== false && str.length > limit)
          throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
        const lowered = str.toLowerCase();
        if (str !== lowered && str !== str.toUpperCase())
          throw new Error(`String must be lowercase or uppercase`);
        str = lowered;
        const sepIndex = str.lastIndexOf("1");
        if (sepIndex === 0 || sepIndex === -1)
          throw new Error(`Letter "1" must be present between prefix and data only`);
        const prefix = str.slice(0, sepIndex);
        const _words2 = str.slice(sepIndex + 1);
        if (_words2.length < 6)
          throw new Error("Data must be at least 6 characters long");
        const words = BECH_ALPHABET3.decode(_words2).slice(0, -6);
        const sum = bechChecksum3(prefix, words, ENCODING_CONST);
        if (!_words2.endsWith(sum))
          throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
        return { prefix, words };
      }
      const decodeUnsafe = unsafeWrapper3(decode4);
      function decodeToBytes(str) {
        const { prefix, words } = decode4(str, false);
        return { prefix, words, bytes: fromWords(words) };
      }
      return { encode: encode2, decode: decode4, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords };
    }
    exports2.bech32 = genBech323("bech32");
    exports2.bech32m = genBech323("bech32m");
    exports2.utf8 = {
      encode: (data) => new TextDecoder().decode(data),
      decode: (str) => new TextEncoder().encode(str)
    };
    exports2.hex = chain3(radix23(4), alphabet3("0123456789abcdef"), join3(""), normalize2((s) => {
      if (typeof s !== "string" || s.length % 2)
        throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
      return s.toLowerCase();
    }));
    var CODERS = {
      utf8: exports2.utf8,
      hex: exports2.hex,
      base16: exports2.base16,
      base32: exports2.base32,
      base64: exports2.base64,
      base64url: exports2.base64url,
      base58: exports2.base58,
      base58xmr: exports2.base58xmr
    };
    var coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(", ")}`;
    var bytesToString = (type, bytes) => {
      if (typeof type !== "string" || !CODERS.hasOwnProperty(type))
        throw new TypeError(coderTypeError);
      if (!(bytes instanceof Uint8Array))
        throw new TypeError("bytesToString() expects Uint8Array");
      return CODERS[type].encode(bytes);
    };
    exports2.bytesToString = bytesToString;
    exports2.str = exports2.bytesToString;
    var stringToBytes = (type, str) => {
      if (!CODERS.hasOwnProperty(type))
        throw new TypeError(coderTypeError);
      if (typeof str !== "string")
        throw new TypeError("stringToBytes() expects string");
      return CODERS[type].decode(str);
    };
    exports2.stringToBytes = stringToBytes;
    exports2.bytes = exports2.stringToBytes;
  }
});

// ../node_modules/light-bolt11-decoder/bolt11.js
var require_bolt11 = __commonJS({
  "../node_modules/light-bolt11-decoder/bolt11.js"(exports2, module2) {
    var { bech32: bech323, hex, utf8 } = require_lib2();
    var DEFAULTNETWORK = {
      // default network is bitcoin
      bech32: "bc",
      pubKeyHash: 0,
      scriptHash: 5,
      validWitnessVersions: [0]
    };
    var TESTNETWORK = {
      bech32: "tb",
      pubKeyHash: 111,
      scriptHash: 196,
      validWitnessVersions: [0]
    };
    var SIGNETNETWORK = {
      bech32: "tbs",
      pubKeyHash: 111,
      scriptHash: 196,
      validWitnessVersions: [0]
    };
    var REGTESTNETWORK = {
      bech32: "bcrt",
      pubKeyHash: 111,
      scriptHash: 196,
      validWitnessVersions: [0]
    };
    var SIMNETWORK = {
      bech32: "sb",
      pubKeyHash: 63,
      scriptHash: 123,
      validWitnessVersions: [0]
    };
    var FEATUREBIT_ORDER = [
      "option_data_loss_protect",
      "initial_routing_sync",
      "option_upfront_shutdown_script",
      "gossip_queries",
      "var_onion_optin",
      "gossip_queries_ex",
      "option_static_remotekey",
      "payment_secret",
      "basic_mpp",
      "option_support_large_channel"
    ];
    var DIVISORS = {
      m: BigInt(1e3),
      u: BigInt(1e6),
      n: BigInt(1e9),
      p: BigInt(1e12)
    };
    var MAX_MILLISATS = BigInt("2100000000000000000");
    var MILLISATS_PER_BTC = BigInt(1e11);
    var TAGCODES = {
      payment_hash: 1,
      payment_secret: 16,
      description: 13,
      payee: 19,
      description_hash: 23,
      // commit to longer descriptions (used by lnurl-pay)
      expiry: 6,
      // default: 3600 (1 hour)
      min_final_cltv_expiry: 24,
      // default: 9
      fallback_address: 9,
      route_hint: 3,
      // for extra routing info (private etc.)
      feature_bits: 5,
      metadata: 27
    };
    var TAGNAMES = {};
    for (let i2 = 0, keys = Object.keys(TAGCODES); i2 < keys.length; i2++) {
      const currentName = keys[i2];
      const currentCode = TAGCODES[keys[i2]].toString();
      TAGNAMES[currentCode] = currentName;
    }
    var TAGPARSERS = {
      1: (words) => hex.encode(bech323.fromWordsUnsafe(words)),
      // 256 bits
      16: (words) => hex.encode(bech323.fromWordsUnsafe(words)),
      // 256 bits
      13: (words) => utf8.encode(bech323.fromWordsUnsafe(words)),
      // string variable length
      19: (words) => hex.encode(bech323.fromWordsUnsafe(words)),
      // 264 bits
      23: (words) => hex.encode(bech323.fromWordsUnsafe(words)),
      // 256 bits
      27: (words) => hex.encode(bech323.fromWordsUnsafe(words)),
      // variable
      6: wordsToIntBE,
      // default: 3600 (1 hour)
      24: wordsToIntBE,
      // default: 9
      3: routingInfoParser,
      // for extra routing info (private etc.)
      5: featureBitsParser
      // keep feature bits as array of 5 bit words
    };
    function getUnknownParser(tagCode) {
      return (words) => ({
        tagCode: parseInt(tagCode),
        words: bech323.encode("unknown", words, Number.MAX_SAFE_INTEGER)
      });
    }
    function wordsToIntBE(words) {
      return words.reverse().reduce((total, item, index) => {
        return total + item * Math.pow(32, index);
      }, 0);
    }
    function routingInfoParser(words) {
      const routes = [];
      let pubkey, shortChannelId, feeBaseMSats, feeProportionalMillionths, cltvExpiryDelta;
      let routesBuffer = bech323.fromWordsUnsafe(words);
      while (routesBuffer.length > 0) {
        pubkey = hex.encode(routesBuffer.slice(0, 33));
        shortChannelId = hex.encode(routesBuffer.slice(33, 41));
        feeBaseMSats = parseInt(hex.encode(routesBuffer.slice(41, 45)), 16);
        feeProportionalMillionths = parseInt(
          hex.encode(routesBuffer.slice(45, 49)),
          16
        );
        cltvExpiryDelta = parseInt(hex.encode(routesBuffer.slice(49, 51)), 16);
        routesBuffer = routesBuffer.slice(51);
        routes.push({
          pubkey,
          short_channel_id: shortChannelId,
          fee_base_msat: feeBaseMSats,
          fee_proportional_millionths: feeProportionalMillionths,
          cltv_expiry_delta: cltvExpiryDelta
        });
      }
      return routes;
    }
    function featureBitsParser(words) {
      const bools = words.slice().reverse().map((word) => [
        !!(word & 1),
        !!(word & 2),
        !!(word & 4),
        !!(word & 8),
        !!(word & 16)
      ]).reduce((finalArr, itemArr) => finalArr.concat(itemArr), []);
      while (bools.length < FEATUREBIT_ORDER.length * 2) {
        bools.push(false);
      }
      const featureBits = {};
      FEATUREBIT_ORDER.forEach((featureName, index) => {
        let status;
        if (bools[index * 2]) {
          status = "required";
        } else if (bools[index * 2 + 1]) {
          status = "supported";
        } else {
          status = "unsupported";
        }
        featureBits[featureName] = status;
      });
      const extraBits = bools.slice(FEATUREBIT_ORDER.length * 2);
      featureBits.extra_bits = {
        start_bit: FEATUREBIT_ORDER.length * 2,
        bits: extraBits,
        has_required: extraBits.reduce(
          (result, bit, index) => index % 2 !== 0 ? result || false : result || bit,
          false
        )
      };
      return featureBits;
    }
    function hrpToMillisat(hrpString, outputString) {
      let divisor, value;
      if (hrpString.slice(-1).match(/^[munp]$/)) {
        divisor = hrpString.slice(-1);
        value = hrpString.slice(0, -1);
      } else if (hrpString.slice(-1).match(/^[^munp0-9]$/)) {
        throw new Error("Not a valid multiplier for the amount");
      } else {
        value = hrpString;
      }
      if (!value.match(/^\d+$/))
        throw new Error("Not a valid human readable amount");
      const valueBN = BigInt(value);
      const millisatoshisBN = divisor ? valueBN * MILLISATS_PER_BTC / DIVISORS[divisor] : valueBN * MILLISATS_PER_BTC;
      if (divisor === "p" && !(valueBN % BigInt(10) === BigInt(0)) || millisatoshisBN > MAX_MILLISATS) {
        throw new Error("Amount is outside of valid range");
      }
      return outputString ? millisatoshisBN.toString() : millisatoshisBN;
    }
    function decode4(paymentRequest, network) {
      if (typeof paymentRequest !== "string")
        throw new Error("Lightning Payment Request must be string");
      if (paymentRequest.slice(0, 2).toLowerCase() !== "ln")
        throw new Error("Not a proper lightning payment request");
      const sections = [];
      const decoded = bech323.decode(paymentRequest, Number.MAX_SAFE_INTEGER);
      paymentRequest = paymentRequest.toLowerCase();
      const prefix = decoded.prefix;
      let words = decoded.words;
      let letters = paymentRequest.slice(prefix.length + 1);
      let sigWords = words.slice(-104);
      words = words.slice(0, -104);
      let prefixMatches = prefix.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
      if (prefixMatches && !prefixMatches[2])
        prefixMatches = prefix.match(/^ln(\S+)$/);
      if (!prefixMatches) {
        throw new Error("Not a proper lightning payment request");
      }
      sections.push({
        name: "lightning_network",
        letters: "ln"
      });
      const bech32Prefix = prefixMatches[1];
      let coinNetwork;
      if (!network) {
        switch (bech32Prefix) {
          case DEFAULTNETWORK.bech32:
            coinNetwork = DEFAULTNETWORK;
            break;
          case TESTNETWORK.bech32:
            coinNetwork = TESTNETWORK;
            break;
          case SIGNETNETWORK.bech32:
            coinNetwork = SIGNETNETWORK;
            break;
          case REGTESTNETWORK.bech32:
            coinNetwork = REGTESTNETWORK;
            break;
          case SIMNETWORK.bech32:
            coinNetwork = SIMNETWORK;
            break;
        }
      } else {
        if (network.bech32 === void 0 || network.pubKeyHash === void 0 || network.scriptHash === void 0 || !Array.isArray(network.validWitnessVersions))
          throw new Error("Invalid network");
        coinNetwork = network;
      }
      if (!coinNetwork || coinNetwork.bech32 !== bech32Prefix) {
        throw new Error("Unknown coin bech32 prefix");
      }
      sections.push({
        name: "coin_network",
        letters: bech32Prefix,
        value: coinNetwork
      });
      const value = prefixMatches[2];
      let millisatoshis;
      if (value) {
        const divisor = prefixMatches[3];
        millisatoshis = hrpToMillisat(value + divisor, true);
        sections.push({
          name: "amount",
          letters: prefixMatches[2] + prefixMatches[3],
          value: millisatoshis
        });
      } else {
        millisatoshis = null;
      }
      sections.push({
        name: "separator",
        letters: "1"
      });
      const timestamp = wordsToIntBE(words.slice(0, 7));
      words = words.slice(7);
      sections.push({
        name: "timestamp",
        letters: letters.slice(0, 7),
        value: timestamp
      });
      letters = letters.slice(7);
      let tagName, parser, tagLength, tagWords;
      while (words.length > 0) {
        const tagCode = words[0].toString();
        tagName = TAGNAMES[tagCode] || "unknown_tag";
        parser = TAGPARSERS[tagCode] || getUnknownParser(tagCode);
        words = words.slice(1);
        tagLength = wordsToIntBE(words.slice(0, 2));
        words = words.slice(2);
        tagWords = words.slice(0, tagLength);
        words = words.slice(tagLength);
        sections.push({
          name: tagName,
          tag: letters[0],
          letters: letters.slice(0, 1 + 2 + tagLength),
          value: parser(tagWords)
          // see: parsers for more comments
        });
        letters = letters.slice(1 + 2 + tagLength);
      }
      sections.push({
        name: "signature",
        letters: letters.slice(0, 104),
        value: hex.encode(bech323.fromWordsUnsafe(sigWords))
      });
      letters = letters.slice(104);
      sections.push({
        name: "checksum",
        letters
      });
      let result = {
        paymentRequest,
        sections,
        get expiry() {
          let exp = sections.find((s) => s.name === "expiry");
          if (exp) return getValue("timestamp") + exp.value;
        },
        get route_hints() {
          return sections.filter((s) => s.name === "route_hint").map((s) => s.value);
        }
      };
      for (let name in TAGCODES) {
        if (name === "route_hint") {
          continue;
        }
        Object.defineProperty(result, name, {
          get() {
            return getValue(name);
          }
        });
      }
      return result;
      function getValue(name) {
        let section = sections.find((s) => s.name === name);
        return section ? section.value : void 0;
      }
    }
    module2.exports = {
      decode: decode4,
      hrpToMillisat
    };
  }
});

// ../node_modules/@nostr-dev-kit/ndk/dist/index.mjs
var import_tseep = __toESM(require_lib(), 1);
var import_debug = __toESM(require_browser(), 1);
var import_debug2 = __toESM(require_browser(), 1);
var import_tseep2 = __toESM(require_lib(), 1);
var import_debug3 = __toESM(require_browser(), 1);

// ../node_modules/nostr-tools/node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i2 = 0; i2 < arrays.length; i2++) {
    arrays[i2].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i2 = 0; i2 < arr.length; i2++) {
    arr[i2] = byteSwap(arr[i2]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i2 = 0; i2 < bytes.length; i2++) {
    hex += hexes[bytes[i2]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function kdfInputToBytes(data, errorTitle = "") {
  if (typeof data === "string")
    return utf8ToBytes(data);
  return abytes(data, void 0, errorTitle);
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i2 = 0; i2 < arrays.length; i2++) {
    const a = arrays[i2];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i2 = 0, pad2 = 0; i2 < arrays.length; i2++) {
    const a = arrays[i2];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function checkOpts(defaults, opts) {
  if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
    throw new Error("options must be object or undefined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// ../node_modules/nostr-tools/node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE3) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE3;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE3 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i2 = pos; i2 < blockLen; i2++)
      buffer[i2] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE3);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i2 = 0; i2 < outLen; i2++)
      oview.setUint32(4 * i2, state[i2], isLE3);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// ../node_modules/nostr-tools/node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i2 = 0; i2 < 16; i2++, offset += 4)
      SHA256_W[i2] = view.getUint32(offset, false);
    for (let i2 = 16; i2 < 64; i2++) {
      const W15 = SHA256_W[i2 - 15];
      const W2 = SHA256_W[i2 - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i2] = s1 + SHA256_W[i2 - 7] + s0 + SHA256_W[i2 - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i2 = 0; i2 < 64; i2++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i2] + SHA256_W[i2] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV[0] | 0;
  B = SHA256_IV[1] | 0;
  C = SHA256_IV[2] | 0;
  D = SHA256_IV[3] | 0;
  E = SHA256_IV[4] | 0;
  F = SHA256_IV[5] | 0;
  G = SHA256_IV[6] | 0;
  H = SHA256_IV[7] | 0;
  constructor() {
    super(32);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// ../node_modules/nostr-tools/node_modules/@noble/curves/utils.js
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
function abool(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new Error("positive bigint expected, got " + n);
  } else
    anumber(n);
  return n;
}
function numberToHexUnpadded(num3) {
  const hex = abignumber(num3).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  n = abignumber(n);
  const res = hexToBytes(n.toString(16).padStart(len * 2, "0"));
  if (res.length !== len)
    throw new Error("number too large");
  return res;
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
function asciiToBytes(ascii) {
  return Uint8Array.from(ascii, (c, i2) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new Error(`string contains non-ASCII character "${ascii[i2]}" with code ${charCode} at position ${i2}`);
    }
    return charCode;
  });
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
var bitMask = (n) => (_1n << BigInt(n)) - _1n;
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber(hashLen, "hashLen");
  anumber(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i2 = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i2 = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i2++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, fields = {}, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// ../node_modules/nostr-tools/node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd3 = b;
  if (gcd3 !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n2) / _4n;
  const root = Fp.pow(n, p1div4);
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i2 = Fp.mul(Fp.mul(nv, _2n), v);
  const root = Fp.mul(nv, Fp.sub(i2, Fp.ONE));
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    let tv1 = Fp.pow(n, c4);
    let tv2 = Fp.mul(tv1, c1);
    const tv3 = Fp.mul(tv1, c2);
    const tv4 = Fp.mul(tv1, c3);
    const e1 = Fp.eql(Fp.sqr(tv2), n);
    const e2 = Fp.eql(Fp.sqr(tv3), n);
    tv1 = Fp.cmov(tv1, tv2, e1);
    tv2 = Fp.cmov(tv4, tv3, e2);
    const e3 = Fp.eql(Fp.sqr(tv2), n);
    const root = Fp.cmov(tv1, tv2, e3);
    assertIsSquare(Fp, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i2 = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i2++;
        t_tmp = Fp.sqr(t_tmp);
        if (i2 === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i2 - 1);
      const b = Fp.pow(c, exponent);
      M = i2;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  return field;
}
function FpPow(Fp, num3, power) {
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return Fp.ONE;
  if (power === _1n2)
    return num3;
  let p = Fp.ONE;
  let d4 = num3;
  while (power > _0n2) {
    if (power & _1n2)
      p = Fp.mul(p, d4);
    d4 = Fp.sqr(d4);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num3, i2) => {
    if (Fp.is0(num3))
      return acc;
    inverted[i2] = acc;
    return Fp.mul(acc, num3);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num3, i2) => {
    if (Fp.is0(num3))
      return acc;
    inverted[i2] = Fp.mul(acc, inverted[i2]);
    return Fp.mul(acc, num3);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n2) / _2n;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _0n2)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        this.sqrt = opts.sqrt;
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = opts.allowedLengths?.slice();
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    this._sqrt = void 0;
    Object.preventExtensions(this);
  }
  create(num3) {
    return mod(num3, this.ORDER);
  }
  isValid(num3) {
    if (typeof num3 !== "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof num3);
    return _0n2 <= num3 && num3 < this.ORDER;
  }
  is0(num3) {
    return num3 === _0n2;
  }
  // is valid and invertible
  isValidNot0(num3) {
    return !this.is0(num3) && this.isValid(num3);
  }
  isOdd(num3) {
    return (num3 & _1n2) === _1n2;
  }
  neg(num3) {
    return mod(-num3, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num3) {
    return mod(num3 * num3, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num3, power) {
    return FpPow(this, num3, power);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num3) {
    return num3 * num3;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num3) {
    return invert(num3, this.ORDER);
  }
  sqrt(num3) {
    if (!this._sqrt)
      this._sqrt = FpSqrt(this.ORDER);
    return this._sqrt(this, num3);
  }
  toBytes(num3) {
    return this.isLE ? numberToBytesLE(num3, this.BYTES) : numberToBytesBE(num3, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes(bytes);
    const { _lengths: allowedLengths, BYTES, isLE: isLE3, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE3 ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE3 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE3 = false) {
  abytes(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num3 = isLE3 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num3, fieldOrder - _1n2) + _1n2;
  return isLE3 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// ../node_modules/nostr-tools/node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i2) => c.fromAffine(p.toAffine(invertedZs[i2])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
var wNAF = class {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point, bits) {
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.Fn = Point.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d4 = elm;
    while (n > _0n3) {
      if (n & _1n3)
        p = p.add(d4);
      d4 = d4.double();
      n >>= _1n3;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i2 = 1; i2 < windowSize; i2++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      if (n === _0n3)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
};
function mulEndoUnsafe(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function createField(order, field, isLE3) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE3 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}
function createKeygen(randomSecretKey, getPublicKey2) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey2(secretKey) };
  };
}

// ../node_modules/nostr-tools/node_modules/@noble/hashes/hmac.js
var _HMAC = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash(hash);
    abytes(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad2 = new Uint8Array(blockLen);
    pad2.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i2 = 0; i2 < pad2.length; i2++)
      pad2[i2] ^= 54;
    this.iHash.update(pad2);
    this.oHash = hash.create();
    for (let i2 = 0; i2 < pad2.length; i2++)
      pad2[i2] ^= 54 ^ 92;
    this.oHash.update(pad2);
    clean(pad2);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new _HMAC(hash, key);

// ../node_modules/nostr-tools/node_modules/@noble/curves/abstract/weierstrass.js
var divNearest = (num3, den) => (num3 + (num3 >= 0 ? den : -den) / _2n2) / den;
function _splitEndoScalar(k, basis, n) {
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k);
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool(optsn.lowS, "lowS");
  abool(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
var DERErr = class extends Error {
  constructor(m = "") {
    super(m);
  }
};
var DER = {
  // asn.1 DER encoding utils
  Err: DERErr,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded(tag);
      return t + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = DER;
      let pos = 0;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num3) {
      const { Err: E } = DER;
      if (num3 < _0n4)
        throw new E("integer: negative integers are not allowed");
      let hex = numberToHexUnpadded(num3);
      if (Number.parseInt(hex[0], 16) & 8)
        hex = "00" + hex;
      if (hex.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex;
    },
    decode(data) {
      const { Err: E } = DER;
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE(data);
    }
  },
  toSig(bytes) {
    const { Err: E, _int: int, _tlv: tlv } = DER;
    const data = abytes(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
var _0n4 = BigInt(0);
var _1n4 = BigInt(1);
var _2n2 = BigInt(2);
var _3n2 = BigInt(3);
var _4n2 = BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const { Fp, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes3(_c, point, isCompressed) {
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes(pprefix(hasEvenY), bx);
    } else {
      return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes3;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp.eql(Z, Fp.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(Z);
    const x = Fp.mul(X, iz);
    const y = Fp.mul(Y, iz);
    const zz = Fp.mul(Z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x, y };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  class Point {
    // base / generator point
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    // zero / infinity / identity point
    static ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    // 0, 1, 0
    // math field
    static Fp = Fp;
    // scalar field
    static Fn = Fn;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = Point.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return Point.fromBytes(hexToBytes(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const bits = Fn.BITS;
  const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  Point.BASE.precompute(8);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn.BYTES
  };
}
function ecdh(Point, ecdhOpts = {}) {
  const { Fn } = Point;
  const randomBytes_ = ecdhOpts.randomBytes || randomBytes;
  const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: getMinHashLength(Fn.ORDER) });
  function isValidSecretKey(secretKey) {
    try {
      const num3 = Fn.fromBytes(secretKey);
      return Fn.isValidNot0(num3);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed = randomBytes_(lengths.seed)) {
    return mapHashToField(abytes(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey2(secretKey, isCompressed = true) {
    return Point.BASE.multiply(Fn.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    if (!isBytes(item))
      return void 0;
    if ("_lengths" in Fn && Fn._lengths || secretKey === publicKey)
      return void 0;
    const l = abytes(item, void 0, "key").length;
    return l === publicKey || l === publicKeyUncompressed;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn.fromBytes(secretKeyA);
    const b = Point.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey2);
  return Object.freeze({ getPublicKey: getPublicKey2, getSharedSecret, keygen, Point, utils, lengths });
}
function ecdsa(Point, hash, ecdsaOpts = {}) {
  ahash(hash);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes4 = ecdsaOpts.randomBytes || randomBytes;
  const hmac3 = ecdsaOpts.hmac || ((key, msg) => hmac(hash, key, msg));
  const { Fp, Fn } = Point;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey: getPublicKey2, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeCofactor = CURVE_ORDER * _2n2 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n4;
    return number > HALF;
  }
  function validateRS(title, num3) {
    if (!Fn.isValidNot0(num3))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num3;
  }
  function assertSmallCofactor() {
    if (hasLargeCofactor)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes(bytes, sizer);
  }
  class Signature {
    r;
    s;
    recovery;
    constructor(r, s, recovery) {
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertSmallCofactor();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point.fromBytes(concatBytes(pprefix((recovery & 1) === 0), x));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(abytes(messageHash, void 0, "msgHash"));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn.toBytes(r);
      const sb = Fn.toBytes(s);
      if (format === "recovered") {
        assertSmallCofactor();
        return concatBytes(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes(rb, sb);
    }
    toHex(format) {
      return bytesToHex(this.toBytes(format));
    }
  }
  const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num3 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num3 >> BigInt(delta) : num3;
  };
  const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
    return Fn.create(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num3) {
    aInRange("num < 2^" + fnBits, num3, _0n4, ORDER_MASK);
    return Fn.toBytes(num3);
  }
  function validateMsgAndHash(message, prehash) {
    abytes(message, void 0, "message");
    return prehash ? abytes(hash(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d4 = Fn.fromBytes(secretKey);
    if (!Fn.isValidNot0(d4))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d4), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes4(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d4));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeCofactor ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash.outputLen, Fn.BYTES, hmac3);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format);
    try {
      const sig = Signature.fromBytes(signature, format);
      const P = Point.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey: getPublicKey2,
    getSharedSecret,
    utils,
    lengths,
    Point,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash
  });
}

// ../node_modules/nostr-tools/node_modules/@noble/curves/secp256k1.js
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _0n5 = /* @__PURE__ */ BigInt(0);
var _2n3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n5, P) * b3 % P;
  const b9 = pow2(b6, _3n5, P) * b3 % P;
  const b11 = pow2(b9, _2n3, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n5, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
var secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256);
var TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(asciiToBytes(tag));
    tagP = concatBytes(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes(tagP, ...messages));
}
var pointToBytes = (point) => point.toBytes(true).slice(1);
var hasEven = (y) => y % _2n3 === _0n5;
function schnorrGetExtPubKey(priv) {
  const { Fn, BASE } = Pointk1;
  const d_ = Fn.fromBytes(priv);
  const p = BASE.multiply(d_);
  const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  const Fp = Fpk1;
  if (!Fp.isValidNot0(x))
    throw new Error("invalid x: Fail if x \u2265 p");
  const xx = Fp.create(x * x);
  const c = Fp.create(xx * x + BigInt(7));
  let y = Fp.sqrt(c);
  if (!hasEven(y))
    y = Fp.neg(y);
  const p = Pointk1.fromAffine({ x, y });
  p.assertValidity();
  return p;
}
var num = bytesToNumberBE;
function challenge(...args) {
  return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(secretKey) {
  return schnorrGetExtPubKey(secretKey).bytes;
}
function schnorrSign(message, secretKey, auxRand = randomBytes(32)) {
  const { Fn } = Pointk1;
  const m = abytes(message, void 0, "message");
  const { bytes: px, scalar: d4 } = schnorrGetExtPubKey(secretKey);
  const a = abytes(auxRand, 32, "auxRand");
  const t = Fn.toBytes(d4 ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(rand);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn.toBytes(Fn.create(k + e * d4)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const { Fp, Fn, BASE } = Pointk1;
  const sig = abytes(signature, 64, "signature");
  const m = abytes(message, void 0, "message");
  const pub = abytes(publicKey, 32, "publicKey");
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!Fp.isValidNot0(r))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!Fn.isValidNot0(s))
      return false;
    const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
    const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
    const { x, y } = R.toAffine();
    if (R.is0() || !hasEven(y) || x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed = randomBytes(seedLength)) => {
    return mapHashToField(seed, secp256k1_CURVE.n);
  };
  return {
    keygen: createKeygen(randomSecretKey, schnorrGetPublicKey),
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    Point: Pointk1,
    utils: {
      randomSecretKey,
      taggedHash,
      lift_x,
      pointToBytes
    },
    lengths: {
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    }
  };
})();

// ../node_modules/nostr-tools/node_modules/@scure/base/index.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(b) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new Error("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new Error(`${label}: string expected`);
  return true;
}
function anumber2(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`invalid integer: ${n}`);
}
function aArr(input) {
  if (!Array.isArray(input))
    throw new Error("array expected");
}
function astrArr(label, input) {
  if (!isArrayOf(true, input))
    throw new Error(`${label}: array of strings expected`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new Error(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode2 = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode4 = args.map((x) => x.decode).reduce(wrap, id);
  return { encode: encode2, decode: decode4 };
}
// @__NO_SIDE_EFFECTS__
function alphabet(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i2) => [l, i2]));
  return {
    encode: (digits) => {
      aArr(digits);
      return digits.map((i2) => {
        if (!Number.isSafeInteger(i2) || i2 < 0 || i2 >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i2}". Allowed: ${letters}`);
        return lettersA[i2];
      });
    },
    decode: (input) => {
      aArr(input);
      return input.map((letter) => {
        astr("alphabet.decode", letter);
        const i2 = indexes.get(letter);
        if (i2 === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i2;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join(separator = "") {
  astr("join", separator);
  return {
    encode: (from) => {
      astrArr("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr("join.decode", to);
      return to.split(separator);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function padding(bits, chr = "=") {
  anumber2(bits);
  astr("padding", chr);
  return {
    encode(data) {
      astrArr("padding.encode", data);
      while (data.length * bits % 8)
        data.push(chr);
      return data;
    },
    decode(input) {
      astrArr("padding.decode", input);
      let end = input.length;
      if (end * bits % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; end > 0 && input[end - 1] === chr; end--) {
        const last = end - 1;
        const byte = last * bits;
        if (byte % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      }
      return input.slice(0, end);
    }
  };
}
var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
var radix2carry = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - gcd(from, to));
var powers = /* @__PURE__ */ (() => {
  let res = [];
  for (let i2 = 0; i2 < 40; i2++)
    res.push(2 ** i2);
  return res;
})();
function convertRadix2(data, from, to, padding2) {
  aArr(data);
  if (from <= 0 || from > 32)
    throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32)
    throw new Error(`convertRadix2: wrong to=${to}`);
  if (/* @__PURE__ */ radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const max = powers[from];
  const mask = powers[to] - 1;
  const res = [];
  for (const n of data) {
    anumber2(n);
    if (n >= max)
      throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32)
      throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (; pos >= to; pos -= to)
      res.push((carry >> pos - to & mask) >>> 0);
    const pow = powers[pos];
    if (pow === void 0)
      throw new Error("invalid carry");
    carry &= pow - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding2 && pos >= from)
    throw new Error("Excess padding");
  if (!padding2 && carry > 0)
    throw new Error(`Non-zero padding: ${carry}`);
  if (padding2 && pos > 0)
    res.push(carry >>> 0);
  return res;
}
// @__NO_SIDE_EFFECTS__
function radix2(bits, revPadding = false) {
  anumber2(bits);
  if (bits <= 0 || bits > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ radix2carry(8, bits) > 32 || /* @__PURE__ */ radix2carry(bits, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (bytes) => {
      if (!isBytes2(bytes))
        throw new Error("radix2.encode input should be Uint8Array");
      return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
    },
    decode: (digits) => {
      anumArr("radix2.decode", digits);
      return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
    }
  };
}
function unsafeWrapper(fn) {
  afn(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
var hasBase64Builtin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toBase64 === "function" && typeof Uint8Array.fromBase64 === "function")();
var decodeBase64Builtin = (s, isUrl) => {
  astr("base64", s);
  const re = isUrl ? /^[A-Za-z0-9=_-]+$/ : /^[A-Za-z0-9=+/]+$/;
  const alphabet3 = isUrl ? "base64url" : "base64";
  if (s.length > 0 && !re.test(s))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(s, { alphabet: alphabet3, lastChunkHandling: "strict" });
};
var base64 = hasBase64Builtin ? {
  encode(b) {
    abytes2(b);
    return b.toBase64();
  },
  decode(s) {
    return decodeBase64Builtin(s, false);
  }
} : /* @__PURE__ */ chain(/* @__PURE__ */ radix2(6), /* @__PURE__ */ alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ padding(6), /* @__PURE__ */ join(""));
var BECH_ALPHABET = /* @__PURE__ */ chain(/* @__PURE__ */ alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ join(""));
var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i2 = 0; i2 < POLYMOD_GENERATORS.length; i2++) {
    if ((b >> i2 & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i2];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i2 = 0; i2 < len; i2++) {
    const c = prefix.charCodeAt(i2);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i2 = 0; i2 < len; i2++)
    chk = bech32Polymod(chk) ^ prefix.charCodeAt(i2) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i2 = 0; i2 < 6; i2++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  return BECH_ALPHABET.encode(convertRadix2([chk % powers[30]], 30, 5, false));
}
// @__NO_SIDE_EFFECTS__
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = /* @__PURE__ */ radix2(5);
  const fromWords = _words.decode;
  const toWords = _words.encode;
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode2(prefix, words, limit = 90) {
    astr("bech32.encode prefix", prefix);
    if (isBytes2(words))
      words = Array.from(words);
    anumArr("bech32.encode", words);
    const plen = prefix.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    const lowered = prefix.toLowerCase();
    const sum = bechChecksum(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET.encode(words)}${sum}`;
  }
  function decode4(str, limit = 90) {
    astr("bech32.decode input", str);
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length: ${slen} (${str}). Expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered && str !== str.toUpperCase())
      throw new Error(`String must be lowercase or uppercase`);
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`Letter "1" must be present between prefix and data only`);
    const prefix = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const words = BECH_ALPHABET.decode(data).slice(0, -6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper(decode4);
  function decodeToBytes(str) {
    const { prefix, words } = decode4(str, false);
    return { prefix, words, bytes: fromWords(words) };
  }
  function encodeFromBytes(prefix, bytes) {
    return encode2(prefix, toWords(bytes));
  }
  return {
    encode: encode2,
    decode: decode4,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
var bech32 = /* @__PURE__ */ genBech32("bech32");

// ../node_modules/@noble/ciphers/utils.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abool2(b) {
  if (typeof b !== "boolean")
    throw new Error(`boolean expected, not ${b}`);
}
function anumber3(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes3(value, length, title = "") {
  const bytes = isBytes3(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance) {
  abytes3(out, void 0, "output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u322(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean2(...arrays) {
  for (let i2 = 0; i2 < arrays.length; i2++) {
    arrays[i2].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
var isLE2 = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function overlapBytes(a, b) {
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input, output) {
  if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function checkOpts2(defaults, opts) {
  if (opts == null || typeof opts !== "object")
    throw new Error("options must be defined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i2 = 0; i2 < a.length; i2++)
    diff |= a[i2] ^ b[i2];
  return diff === 0;
}
var wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
  function wrappedCipher(key, ...args) {
    abytes3(key, void 0, "key");
    if (!isLE2)
      throw new Error("Non little-endian hardware is not yet supported");
    if (params.nonceLength !== void 0) {
      const nonce = args[0];
      abytes3(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
    }
    const tagl = params.tagLength;
    if (tagl && args[1] !== void 0)
      abytes3(args[1], void 0, "AAD");
    const cipher = constructor(key, ...args);
    const checkOutput = (fnLength, output) => {
      if (output !== void 0) {
        if (fnLength !== 2)
          throw new Error("cipher output not supported");
        abytes3(output, void 0, "output");
      }
    };
    let called = false;
    const wrCipher = {
      encrypt(data, output) {
        if (called)
          throw new Error("cannot encrypt() twice with same key + nonce");
        called = true;
        abytes3(data);
        checkOutput(cipher.encrypt.length, output);
        return cipher.encrypt(data, output);
      },
      decrypt(data, output) {
        abytes3(data);
        if (tagl && data.length < tagl)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
        checkOutput(cipher.decrypt.length, output);
        return cipher.decrypt(data, output);
      }
    };
    return wrCipher;
  }
  Object.assign(wrappedCipher, params);
  return wrappedCipher;
};
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  if (out.length !== expectedLength)
    throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function u64Lengths(dataLength, aadLength, isLE3) {
  abool2(isLE3);
  const num3 = new Uint8Array(16);
  const view = createView2(num3);
  view.setBigUint64(0, BigInt(aadLength), isLE3);
  view.setBigUint64(8, BigInt(dataLength), isLE3);
  return num3;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes2(bytes) {
  return Uint8Array.from(bytes);
}

// ../node_modules/@noble/ciphers/aes.js
var BLOCK_SIZE = 16;
var POLY = 283;
function validateKeyLength(key) {
  if (![16, 24, 32].includes(key.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + key.length);
}
function mul2(n) {
  return n << 1 ^ POLY & -(n >> 7);
}
function mul(a, b) {
  let res = 0;
  for (; b > 0; b >>= 1) {
    res ^= a & -(b & 1);
    a = mul2(a);
  }
  return res;
}
var sbox = /* @__PURE__ */ (() => {
  const t = new Uint8Array(256);
  for (let i2 = 0, x = 1; i2 < 256; i2++, x ^= mul2(x))
    t[i2] = x;
  const box = new Uint8Array(256);
  box[0] = 99;
  for (let i2 = 0; i2 < 255; i2++) {
    let x = t[255 - i2];
    x |= x << 8;
    box[t[i2]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
  }
  clean2(t);
  return box;
})();
var invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
var rotr32_8 = (n) => n << 24 | n >>> 8;
var rotl32_8 = (n) => n << 8 | n >>> 24;
function genTtable(sbox2, fn) {
  if (sbox2.length !== 256)
    throw new Error("Wrong sbox length");
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
  const T1 = T0.map(rotl32_8);
  const T2 = T1.map(rotl32_8);
  const T3 = T2.map(rotl32_8);
  const T01 = new Uint32Array(256 * 256);
  const T23 = new Uint32Array(256 * 256);
  const sbox22 = new Uint16Array(256 * 256);
  for (let i2 = 0; i2 < 256; i2++) {
    for (let j = 0; j < 256; j++) {
      const idx = i2 * 256 + j;
      T01[idx] = T0[i2] ^ T1[j];
      T23[idx] = T2[i2] ^ T3[j];
      sbox22[idx] = sbox2[i2] << 8 | sbox2[j];
    }
  }
  return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
}
var tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
var tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
var xPowers = /* @__PURE__ */ (() => {
  const p = new Uint8Array(16);
  for (let i2 = 0, x = 1; i2 < 16; i2++, x = mul2(x))
    p[i2] = x;
  return p;
})();
function expandKeyLE(key) {
  abytes3(key);
  const len = key.length;
  validateKeyLength(key);
  const { sbox2 } = tableEncoding;
  const toClean = [];
  if (!isAligned32(key))
    toClean.push(key = copyBytes2(key));
  const k32 = u322(key);
  const Nk = k32.length;
  const subByte = (n) => applySbox(sbox2, n, n, n, n);
  const xk = new Uint32Array(len + 28);
  xk.set(k32);
  for (let i2 = Nk; i2 < xk.length; i2++) {
    let t = xk[i2 - 1];
    if (i2 % Nk === 0)
      t = subByte(rotr32_8(t)) ^ xPowers[i2 / Nk - 1];
    else if (Nk > 6 && i2 % Nk === 4)
      t = subByte(t);
    xk[i2] = xk[i2 - Nk] ^ t;
  }
  clean2(...toClean);
  return xk;
}
function expandKeyDecLE(key) {
  const encKey = expandKeyLE(key);
  const xk = encKey.slice();
  const Nk = encKey.length;
  const { sbox2 } = tableEncoding;
  const { T0, T1, T2, T3 } = tableDecoding;
  for (let i2 = 0; i2 < Nk; i2 += 4) {
    for (let j = 0; j < 4; j++)
      xk[i2 + j] = encKey[Nk - i2 - 4 + j];
  }
  clean2(encKey);
  for (let i2 = 4; i2 < Nk - 4; i2++) {
    const x = xk[i2];
    const w = applySbox(sbox2, x, x, x, x);
    xk[i2] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
  }
  return xk;
}
function apply0123(T01, T23, s0, s1, s2, s3) {
  return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function applySbox(sbox2, s0, s1, s2, s3) {
  return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
}
function encrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i2 = 0; i2 < rounds; i2++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function decrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i2 = 0; i2 < rounds; i2++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function validateBlockDecrypt(data) {
  abytes3(data);
  if (data.length % BLOCK_SIZE !== 0) {
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + BLOCK_SIZE);
  }
}
function validateBlockEncrypt(plaintext, pcks5, dst) {
  abytes3(plaintext);
  let outLen = plaintext.length;
  const remaining = outLen % BLOCK_SIZE;
  if (!pcks5 && remaining !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (!isAligned32(plaintext))
    plaintext = copyBytes2(plaintext);
  const b = u322(plaintext);
  if (pcks5) {
    let left = BLOCK_SIZE - remaining;
    if (!left)
      left = BLOCK_SIZE;
    outLen = outLen + left;
  }
  dst = getOutput(outLen, dst);
  complexOverlapBytes(plaintext, dst);
  const o = u322(dst);
  return { b, o, out: dst };
}
function validatePCKS(data, pcks5) {
  if (!pcks5)
    return data;
  const len = data.length;
  if (!len)
    throw new Error("aes/pcks5: empty ciphertext not allowed");
  const lastByte = data[len - 1];
  if (lastByte <= 0 || lastByte > 16)
    throw new Error("aes/pcks5: wrong padding");
  const out = data.subarray(0, -lastByte);
  for (let i2 = 0; i2 < lastByte; i2++)
    if (data[len - i2 - 1] !== lastByte)
      throw new Error("aes/pcks5: wrong padding");
  return out;
}
function padPCKS(left) {
  const tmp = new Uint8Array(16);
  const tmp32 = u322(tmp);
  tmp.set(left);
  const paddingByte = BLOCK_SIZE - left.length;
  for (let i2 = BLOCK_SIZE - paddingByte; i2 < BLOCK_SIZE; i2++)
    tmp[i2] = paddingByte;
  return tmp32;
}
var cbc = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescbc(key, iv, opts = {}) {
  const pcks5 = !opts.disablePadding;
  return {
    encrypt(plaintext, dst) {
      const xk = expandKeyLE(key);
      const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
      let _iv = iv;
      const toClean = [xk];
      if (!isAligned32(_iv))
        toClean.push(_iv = copyBytes2(_iv));
      const n32 = u322(_iv);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      let i2 = 0;
      for (; i2 + 4 <= b.length; ) {
        s0 ^= b[i2 + 0], s1 ^= b[i2 + 1], s2 ^= b[i2 + 2], s3 ^= b[i2 + 3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i2++] = s0, o[i2++] = s1, o[i2++] = s2, o[i2++] = s3;
      }
      if (pcks5) {
        const tmp32 = padPCKS(plaintext.subarray(i2 * 4));
        s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i2++] = s0, o[i2++] = s1, o[i2++] = s2, o[i2++] = s3;
      }
      clean2(...toClean);
      return _out;
    },
    decrypt(ciphertext, dst) {
      validateBlockDecrypt(ciphertext);
      const xk = expandKeyDecLE(key);
      let _iv = iv;
      const toClean = [xk];
      if (!isAligned32(_iv))
        toClean.push(_iv = copyBytes2(_iv));
      const n32 = u322(_iv);
      dst = getOutput(ciphertext.length, dst);
      if (!isAligned32(ciphertext))
        toClean.push(ciphertext = copyBytes2(ciphertext));
      complexOverlapBytes(ciphertext, dst);
      const b = u322(ciphertext);
      const o = u322(dst);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      for (let i2 = 0; i2 + 4 <= b.length; ) {
        const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
        s0 = b[i2 + 0], s1 = b[i2 + 1], s2 = b[i2 + 2], s3 = b[i2 + 3];
        const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
        o[i2++] = o0 ^ ps0, o[i2++] = o1 ^ ps1, o[i2++] = o2 ^ ps2, o[i2++] = o3 ^ ps3;
      }
      clean2(...toClean);
      return validatePCKS(dst, pcks5);
    }
  };
});
function isBytes32(a) {
  return a instanceof Uint32Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint32Array";
}
function encryptBlock(xk, block) {
  abytes3(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_encryptBlock accepts result of expandKeyLE");
  const b32 = u322(block);
  let { s0, s1, s2, s3 } = encrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  return block;
}
function dbl(block) {
  let carry = 0;
  for (let i2 = BLOCK_SIZE - 1; i2 >= 0; i2--) {
    const newCarry = (block[i2] & 128) >>> 7;
    block[i2] = block[i2] << 1 | carry;
    carry = newCarry;
  }
  if (carry) {
    block[BLOCK_SIZE - 1] ^= 135;
  }
  return block;
}
function xorBlock(a, b) {
  if (a.length !== b.length)
    throw new Error("xorBlock: blocks must have same length");
  for (let i2 = 0; i2 < a.length; i2++) {
    a[i2] = a[i2] ^ b[i2];
  }
  return a;
}
var _CMAC = class {
  buffer;
  destroyed;
  k1;
  k2;
  xk;
  constructor(key) {
    abytes3(key);
    validateKeyLength(key);
    this.xk = expandKeyLE(key);
    this.buffer = new Uint8Array(0);
    this.destroyed = false;
    const L = new Uint8Array(BLOCK_SIZE);
    encryptBlock(this.xk, L);
    this.k1 = dbl(L);
    this.k2 = dbl(new Uint8Array(this.k1));
  }
  update(data) {
    const { destroyed, buffer } = this;
    if (destroyed)
      throw new Error("CMAC instance was destroyed");
    abytes3(data);
    const newBuffer = new Uint8Array(buffer.length + data.length);
    newBuffer.set(buffer);
    newBuffer.set(data, buffer.length);
    this.buffer = newBuffer;
    return this;
  }
  // see https://www.rfc-editor.org/rfc/rfc4493.html#section-2.4
  digest() {
    if (this.destroyed)
      throw new Error("CMAC instance was destroyed");
    const { buffer } = this;
    const msgLen = buffer.length;
    let n = Math.ceil(msgLen / BLOCK_SIZE);
    let flag;
    if (n === 0) {
      n = 1;
      flag = false;
    } else {
      flag = msgLen % BLOCK_SIZE === 0;
    }
    const lastBlockStart = (n - 1) * BLOCK_SIZE;
    const lastBlockData = buffer.subarray(lastBlockStart);
    let m_last;
    if (flag) {
      m_last = xorBlock(new Uint8Array(lastBlockData), this.k1);
    } else {
      const padded = new Uint8Array(BLOCK_SIZE);
      padded.set(lastBlockData);
      padded[lastBlockData.length] = 128;
      m_last = xorBlock(padded, this.k2);
    }
    let x = new Uint8Array(BLOCK_SIZE);
    for (let i2 = 0; i2 < n - 1; i2++) {
      const m_i = buffer.subarray(i2 * BLOCK_SIZE, (i2 + 1) * BLOCK_SIZE);
      xorBlock(x, m_i);
      encryptBlock(this.xk, x);
    }
    xorBlock(x, m_last);
    encryptBlock(this.xk, x);
    clean2(m_last);
    return x;
  }
  destroy() {
    const { buffer, destroyed, xk, k1, k2 } = this;
    if (destroyed)
      return;
    this.destroyed = true;
    clean2(buffer, xk, k1, k2);
  }
};
var cmac = (key, message) => new _CMAC(key).update(message).digest();
cmac.create = (key) => new _CMAC(key);

// ../node_modules/@noble/ciphers/_arx.js
var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
var sigma16 = encodeStr("expand 16-byte k");
var sigma32 = encodeStr("expand 32-byte k");
var sigma16_32 = u322(sigma16);
var sigma32_32 = u322(sigma32);
function rotl2(a, b) {
  return a << b | a >>> 32 - b;
}
function isAligned322(b) {
  return b.byteOffset % 4 === 0;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = 2 ** 32 - 1;
var U32_EMPTY = Uint32Array.of();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
  const len = data.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u322(block);
  const isAligned = isAligned322(data) && isAligned322(output);
  const d32 = isAligned ? u322(data) : U32_EMPTY;
  const o32 = isAligned ? u322(output) : U32_EMPTY;
  for (let pos = 0; pos < len; counter++) {
    core(sigma, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj; j < take; j++) {
      posj = pos + j;
      output[posj] = data[posj] ^ block[j];
    }
    pos += take;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts2({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  anumber3(counterLength);
  anumber3(rounds);
  abool2(counterRight);
  abool2(allowShortKeys);
  return (key, nonce, data, output, counter = 0) => {
    abytes3(key, void 0, "key");
    abytes3(nonce, void 0, "nonce");
    abytes3(data, void 0, "data");
    const len = data.length;
    if (output === void 0)
      output = new Uint8Array(len);
    abytes3(output, void 0, "output");
    anumber3(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    if (output.length < len)
      throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
    const toClean = [];
    let l = key.length;
    let k;
    let sigma;
    if (l === 32) {
      toClean.push(k = copyBytes2(key));
      sigma = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma = sigma16_32;
      toClean.push(k);
    } else {
      abytes3(key, 32, "arx key");
      throw new Error("invalid key size");
    }
    if (!isAligned322(nonce))
      toClean.push(nonce = copyBytes2(nonce));
    const k32 = u322(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error(`arx: extended nonce must be 24 bytes`);
      extendNonceFn(sigma, k32, u322(nonce.subarray(0, 16)), k32);
      nonce = nonce.subarray(16);
    }
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12);
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc;
      toClean.push(nonce);
    }
    const n32 = u322(nonce);
    runCipher(core, sigma, k32, n32, data, output, counter, rounds);
    clean2(...toClean);
    return output;
  };
}

// ../node_modules/@noble/ciphers/_poly1305.js
function u8to16(a, i2) {
  return a[i2++] & 255 | (a[i2++] & 255) << 8;
}
var Poly1305 = class {
  blockLen = 16;
  outputLen = 16;
  buffer = new Uint8Array(16);
  r = new Uint16Array(10);
  // Allocating 1 array with .subarray() here is slower than 3
  h = new Uint16Array(10);
  pad = new Uint16Array(8);
  pos = 0;
  finished = false;
  // Can be speed-up using BigUint64Array, at the cost of complexity
  constructor(key) {
    key = copyBytes2(abytes3(key, 32, "key"));
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i2 = 0; i2 < 8; i2++)
      this.pad[i2] = u8to16(key, 16 + 2 * i2);
  }
  process(data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data, offset + 0);
    const t1 = u8to16(data, offset + 2);
    const t2 = u8to16(data, offset + 4);
    const t3 = u8to16(data, offset + 6);
    const t4 = u8to16(data, offset + 8);
    const t5 = u8to16(data, offset + 10);
    const t6 = u8to16(data, offset + 12);
    const t7 = u8to16(data, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d22 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d22 >>> 13;
    d22 &= 8191;
    d22 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d22 >>> 13;
    d22 &= 8191;
    let d32 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d32 >>> 13;
    d32 &= 8191;
    d32 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d32 >>> 13;
    d32 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d22;
    h[3] = d32;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad: pad2 } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i2 = 2; i2 < 10; i2++) {
      h[i2] += c;
      c = h[i2] >>> 13;
      h[i2] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i2 = 1; i2 < 10; i2++) {
      g[i2] = h[i2] + c;
      c = g[i2] >>> 13;
      g[i2] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i2 = 0; i2 < 10; i2++)
      g[i2] &= mask;
    mask = ~mask;
    for (let i2 = 0; i2 < 10; i2++)
      h[i2] = h[i2] & mask | g[i2];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad2[0];
    h[0] = f & 65535;
    for (let i2 = 1; i2 < 8; i2++) {
      f = (h[i2] + pad2[i2] | 0) + (f >>> 16) | 0;
      h[i2] = f & 65535;
    }
    clean2(g);
  }
  update(data) {
    aexists2(this);
    abytes3(data);
    data = copyBytes2(data);
    const { buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(data, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    clean2(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(out) {
    aexists2(this);
    aoutput2(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (; pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i2 = 0; i2 < 8; i2++) {
      out[opos++] = h[i2] >>> 0;
      out[opos++] = h[i2] >>> 8;
    }
    return out;
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
};
function wrapConstructorWithKey(hashCons) {
  const hashC = (msg, key) => hashCons(key).update(msg).digest();
  const tmp = hashCons(new Uint8Array(32));
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (key) => hashCons(key);
  return hashC;
}
var poly1305 = /* @__PURE__ */ (() => wrapConstructorWithKey((key) => new Poly1305(key)))();

// ../node_modules/@noble/ciphers/chacha.js
function chachaCore(s, k, n, out, cnt, rounds = 20) {
  let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0; r < rounds; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl2(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl2(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl2(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl2(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl2(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl2(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl2(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl2(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl2(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl2(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl2(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl2(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl2(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl2(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl2(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl2(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl2(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl2(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl2(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl2(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl2(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl2(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl2(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl2(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl2(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl2(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl2(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl2(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl2(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl2(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl2(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl2(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i2, out) {
  let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i2[0], x13 = i2[1], x14 = i2[2], x15 = i2[3];
  for (let r = 0; r < 20; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl2(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl2(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl2(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl2(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl2(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl2(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl2(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl2(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl2(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl2(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl2(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl2(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl2(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl2(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl2(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl2(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl2(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl2(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl2(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl2(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl2(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl2(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl2(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl2(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl2(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl2(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl2(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl2(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl2(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl2(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl2(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl2(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = x00;
  out[oi++] = x01;
  out[oi++] = x02;
  out[oi++] = x03;
  out[oi++] = x12;
  out[oi++] = x13;
  out[oi++] = x14;
  out[oi++] = x15;
}
var chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 4,
  allowShortKeys: false
});
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 8,
  extendNonceFn: hchacha,
  allowShortKeys: false
});
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
  h.update(msg);
  const leftover = msg.length % 16;
  if (leftover)
    h.update(ZEROS16.subarray(leftover));
};
var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, ciphertext, AAD) {
  if (AAD !== void 0)
    abytes3(AAD, void 0, "AAD");
  const authKey = fn(key, nonce, ZEROS32);
  const lengths = u64Lengths(ciphertext.length, AAD ? AAD.length : 0, true);
  const h = poly1305.create(authKey);
  if (AAD)
    updatePadded(h, AAD);
  updatePadded(h, ciphertext);
  h.update(lengths);
  const res = h.digest();
  clean2(authKey, lengths);
  return res;
}
var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
  const tagLength = 16;
  return {
    encrypt(plaintext, output) {
      const plength = plaintext.length;
      output = getOutput(plength + tagLength, output, false);
      output.set(plaintext);
      const oPlain = output.subarray(0, -tagLength);
      xorStream(key, nonce, oPlain, oPlain, 1);
      const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
      output.set(tag, plength);
      clean2(tag);
      return output;
    },
    decrypt(ciphertext, output) {
      output = getOutput(ciphertext.length - tagLength, output, false);
      const data = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = computeTag(xorStream, key, nonce, data, AAD);
      if (!equalBytes(passedTag, tag))
        throw new Error("invalid tag");
      output.set(ciphertext.subarray(0, -tagLength));
      xorStream(key, nonce, output, output, 1);
      clean2(tag);
      return output;
    }
  };
};
var chacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead(chacha20));
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead(xchacha20));

// ../node_modules/nostr-tools/node_modules/@noble/hashes/hkdf.js
function extract(hash, ikm, salt) {
  ahash(hash);
  if (salt === void 0)
    salt = new Uint8Array(hash.outputLen);
  return hmac(hash, salt, ikm);
}
var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
function expand(hash, prk, info, length = 32) {
  ahash(hash);
  anumber(length, "length");
  const olen = hash.outputLen;
  if (length > 255 * olen)
    throw new Error("Length must be <= 255*HashLen");
  const blocks = Math.ceil(length / olen);
  if (info === void 0)
    info = EMPTY_BUFFER;
  else
    abytes(info, void 0, "info");
  const okm = new Uint8Array(blocks * olen);
  const HMAC2 = hmac.create(hash, prk);
  const HMACTmp = HMAC2._cloneInto();
  const T = new Uint8Array(HMAC2.outputLen);
  for (let counter = 0; counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
    okm.set(T, olen * counter);
    HMAC2._cloneInto(HMACTmp);
  }
  HMAC2.destroy();
  HMACTmp.destroy();
  clean(T, HKDF_COUNTER);
  return okm.slice(0, length);
}

// ../node_modules/nostr-tools/lib/esm/index.js
var __defProp2 = Object.defineProperty;
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var verifiedSymbol = /* @__PURE__ */ Symbol("verified");
var isRecord = (obj) => obj instanceof Object;
function validateEvent(event) {
  if (!isRecord(event))
    return false;
  if (typeof event.kind !== "number")
    return false;
  if (typeof event.content !== "string")
    return false;
  if (typeof event.created_at !== "number")
    return false;
  if (typeof event.pubkey !== "string")
    return false;
  if (!event.pubkey.match(/^[a-f0-9]{64}$/))
    return false;
  if (!Array.isArray(event.tags))
    return false;
  for (let i2 = 0; i2 < event.tags.length; i2++) {
    let tag = event.tags[i2];
    if (!Array.isArray(tag))
      return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] !== "string")
        return false;
    }
  }
  return true;
}
var utils_exports = {};
__export2(utils_exports, {
  binarySearch: () => binarySearch,
  bytesToHex: () => bytesToHex,
  hexToBytes: () => hexToBytes,
  insertEventIntoAscendingList: () => insertEventIntoAscendingList,
  insertEventIntoDescendingList: () => insertEventIntoDescendingList,
  mergeReverseSortedLists: () => mergeReverseSortedLists,
  normalizeURL: () => normalizeURL,
  utf8Decoder: () => utf8Decoder,
  utf8Encoder: () => utf8Encoder
});
var utf8Decoder = new TextDecoder("utf-8");
var utf8Encoder = new TextEncoder();
function normalizeURL(url) {
  try {
    if (url.indexOf("://") === -1)
      url = "wss://" + url;
    let p = new URL(url);
    if (p.protocol === "http:")
      p.protocol = "ws:";
    else if (p.protocol === "https:")
      p.protocol = "wss:";
    p.pathname = p.pathname.replace(/\/+/g, "/");
    if (p.pathname.endsWith("/"))
      p.pathname = p.pathname.slice(0, -1);
    if (p.port === "80" && p.protocol === "ws:" || p.port === "443" && p.protocol === "wss:")
      p.port = "";
    p.searchParams.sort();
    p.hash = "";
    return p.toString();
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }
}
function insertEventIntoDescendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return b.created_at - event.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function insertEventIntoAscendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return event.created_at - b.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function binarySearch(arr, compare) {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const cmp = compare(arr[mid]);
    if (cmp === 0) {
      return [mid, true];
    }
    if (cmp < 0) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return [start, false];
}
function mergeReverseSortedLists(list1, list2) {
  const result = new Array(list1.length + list2.length);
  result.length = 0;
  let i1 = 0;
  let i2 = 0;
  let sameTimestampIds = [];
  while (i1 < list1.length && i2 < list2.length) {
    let next;
    if (list1[i1]?.created_at > list2[i2]?.created_at) {
      next = list1[i1];
      i1++;
    } else {
      next = list2[i2];
      i2++;
    }
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  while (i1 < list1.length) {
    const next = list1[i1];
    i1++;
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  while (i2 < list2.length) {
    const next = list2[i2];
    i2++;
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  return result;
}
var JS = class {
  generateSecretKey() {
    return schnorr.utils.randomSecretKey();
  }
  getPublicKey(secretKey) {
    return bytesToHex(schnorr.getPublicKey(secretKey));
  }
  finalizeEvent(t, secretKey) {
    const event = t;
    event.pubkey = bytesToHex(schnorr.getPublicKey(secretKey));
    event.id = getEventHash(event);
    event.sig = bytesToHex(schnorr.sign(hexToBytes(getEventHash(event)), secretKey));
    event[verifiedSymbol] = true;
    return event;
  }
  verifyEvent(event) {
    if (typeof event[verifiedSymbol] === "boolean")
      return event[verifiedSymbol];
    const hash = getEventHash(event);
    if (hash !== event.id) {
      event[verifiedSymbol] = false;
      return false;
    }
    try {
      const valid = schnorr.verify(hexToBytes(event.sig), hexToBytes(hash), hexToBytes(event.pubkey));
      event[verifiedSymbol] = valid;
      return valid;
    } catch (err) {
      event[verifiedSymbol] = false;
      return false;
    }
  }
};
function serializeEvent(evt) {
  if (!validateEvent(evt))
    throw new Error("can't serialize event with wrong or missing properties");
  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
}
function getEventHash(event) {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)));
  return bytesToHex(eventHash);
}
var i = new JS();
var generateSecretKey = i.generateSecretKey;
var getPublicKey = i.getPublicKey;
var finalizeEvent = i.finalizeEvent;
var verifyEvent = i.verifyEvent;
var kinds_exports = {};
__export2(kinds_exports, {
  Application: () => Application,
  BadgeAward: () => BadgeAward,
  BadgeDefinition: () => BadgeDefinition,
  BlockedRelaysList: () => BlockedRelaysList,
  BlossomServerList: () => BlossomServerList,
  BookmarkList: () => BookmarkList,
  Bookmarksets: () => Bookmarksets,
  Calendar: () => Calendar,
  CalendarEventRSVP: () => CalendarEventRSVP,
  ChannelCreation: () => ChannelCreation,
  ChannelHideMessage: () => ChannelHideMessage,
  ChannelMessage: () => ChannelMessage,
  ChannelMetadata: () => ChannelMetadata,
  ChannelMuteUser: () => ChannelMuteUser,
  ChatMessage: () => ChatMessage,
  ClassifiedListing: () => ClassifiedListing,
  ClientAuth: () => ClientAuth,
  Comment: () => Comment,
  CommunitiesList: () => CommunitiesList,
  CommunityDefinition: () => CommunityDefinition,
  CommunityPostApproval: () => CommunityPostApproval,
  Contacts: () => Contacts,
  CreateOrUpdateProduct: () => CreateOrUpdateProduct,
  CreateOrUpdateStall: () => CreateOrUpdateStall,
  Curationsets: () => Curationsets,
  Date: () => Date2,
  DirectMessageRelaysList: () => DirectMessageRelaysList,
  DraftClassifiedListing: () => DraftClassifiedListing,
  DraftLong: () => DraftLong,
  Emojisets: () => Emojisets,
  EncryptedDirectMessage: () => EncryptedDirectMessage,
  EventDeletion: () => EventDeletion,
  FavoriteRelays: () => FavoriteRelays,
  FileMessage: () => FileMessage,
  FileMetadata: () => FileMetadata,
  FileServerPreference: () => FileServerPreference,
  Followsets: () => Followsets,
  ForumThread: () => ForumThread,
  GenericRepost: () => GenericRepost,
  Genericlists: () => Genericlists,
  GiftWrap: () => GiftWrap,
  GroupMetadata: () => GroupMetadata,
  HTTPAuth: () => HTTPAuth,
  Handlerinformation: () => Handlerinformation,
  Handlerrecommendation: () => Handlerrecommendation,
  Highlights: () => Highlights,
  InterestsList: () => InterestsList,
  Interestsets: () => Interestsets,
  JobFeedback: () => JobFeedback,
  JobRequest: () => JobRequest,
  JobResult: () => JobResult,
  Label: () => Label,
  LightningPubRPC: () => LightningPubRPC,
  LiveChatMessage: () => LiveChatMessage,
  LiveEvent: () => LiveEvent,
  LongFormArticle: () => LongFormArticle,
  Metadata: () => Metadata,
  Mutelist: () => Mutelist,
  NWCWalletInfo: () => NWCWalletInfo,
  NWCWalletRequest: () => NWCWalletRequest,
  NWCWalletResponse: () => NWCWalletResponse,
  NormalVideo: () => NormalVideo,
  NostrConnect: () => NostrConnect,
  OpenTimestamps: () => OpenTimestamps,
  Photo: () => Photo,
  Pinlist: () => Pinlist,
  Poll: () => Poll,
  PollResponse: () => PollResponse,
  PrivateDirectMessage: () => PrivateDirectMessage,
  ProblemTracker: () => ProblemTracker,
  ProfileBadges: () => ProfileBadges,
  PublicChatsList: () => PublicChatsList,
  Reaction: () => Reaction,
  RecommendRelay: () => RecommendRelay,
  RelayList: () => RelayList,
  RelayReview: () => RelayReview,
  Relaysets: () => Relaysets,
  Report: () => Report,
  Reporting: () => Reporting,
  Repost: () => Repost,
  Seal: () => Seal,
  SearchRelaysList: () => SearchRelaysList,
  ShortTextNote: () => ShortTextNote,
  ShortVideo: () => ShortVideo,
  Time: () => Time,
  UserEmojiList: () => UserEmojiList,
  UserStatuses: () => UserStatuses,
  Voice: () => Voice,
  VoiceComment: () => VoiceComment,
  Zap: () => Zap,
  ZapGoal: () => ZapGoal,
  ZapRequest: () => ZapRequest,
  classifyKind: () => classifyKind,
  isAddressableKind: () => isAddressableKind,
  isEphemeralKind: () => isEphemeralKind,
  isKind: () => isKind,
  isRegularKind: () => isRegularKind,
  isReplaceableKind: () => isReplaceableKind
});
function isRegularKind(kind) {
  return kind < 1e4 && kind !== 0 && kind !== 3;
}
function isReplaceableKind(kind) {
  return kind === 0 || kind === 3 || 1e4 <= kind && kind < 2e4;
}
function isEphemeralKind(kind) {
  return 2e4 <= kind && kind < 3e4;
}
function isAddressableKind(kind) {
  return 3e4 <= kind && kind < 4e4;
}
function classifyKind(kind) {
  if (isRegularKind(kind))
    return "regular";
  if (isReplaceableKind(kind))
    return "replaceable";
  if (isEphemeralKind(kind))
    return "ephemeral";
  if (isAddressableKind(kind))
    return "parameterized";
  return "unknown";
}
function isKind(event, kind) {
  const kindAsArray = kind instanceof Array ? kind : [kind];
  return validateEvent(event) && kindAsArray.includes(event.kind) || false;
}
var Metadata = 0;
var ShortTextNote = 1;
var RecommendRelay = 2;
var Contacts = 3;
var EncryptedDirectMessage = 4;
var EventDeletion = 5;
var Repost = 6;
var Reaction = 7;
var BadgeAward = 8;
var ChatMessage = 9;
var ForumThread = 11;
var Seal = 13;
var PrivateDirectMessage = 14;
var FileMessage = 15;
var GenericRepost = 16;
var Photo = 20;
var NormalVideo = 21;
var ShortVideo = 22;
var ChannelCreation = 40;
var ChannelMetadata = 41;
var ChannelMessage = 42;
var ChannelHideMessage = 43;
var ChannelMuteUser = 44;
var OpenTimestamps = 1040;
var GiftWrap = 1059;
var Poll = 1068;
var FileMetadata = 1063;
var Comment = 1111;
var LiveChatMessage = 1311;
var Voice = 1222;
var VoiceComment = 1244;
var ProblemTracker = 1971;
var Report = 1984;
var Reporting = 1984;
var Label = 1985;
var CommunityPostApproval = 4550;
var JobRequest = 5999;
var JobResult = 6999;
var JobFeedback = 7e3;
var ZapGoal = 9041;
var ZapRequest = 9734;
var Zap = 9735;
var Highlights = 9802;
var PollResponse = 1018;
var Mutelist = 1e4;
var Pinlist = 10001;
var RelayList = 10002;
var BookmarkList = 10003;
var CommunitiesList = 10004;
var PublicChatsList = 10005;
var BlockedRelaysList = 10006;
var SearchRelaysList = 10007;
var FavoriteRelays = 10012;
var InterestsList = 10015;
var UserEmojiList = 10030;
var DirectMessageRelaysList = 10050;
var FileServerPreference = 10096;
var BlossomServerList = 10063;
var NWCWalletInfo = 13194;
var LightningPubRPC = 21e3;
var ClientAuth = 22242;
var NWCWalletRequest = 23194;
var NWCWalletResponse = 23195;
var NostrConnect = 24133;
var HTTPAuth = 27235;
var Followsets = 3e4;
var Genericlists = 30001;
var Relaysets = 30002;
var Bookmarksets = 30003;
var Curationsets = 30004;
var ProfileBadges = 30008;
var BadgeDefinition = 30009;
var Interestsets = 30015;
var CreateOrUpdateStall = 30017;
var CreateOrUpdateProduct = 30018;
var LongFormArticle = 30023;
var DraftLong = 30024;
var Emojisets = 30030;
var Application = 30078;
var LiveEvent = 30311;
var UserStatuses = 30315;
var ClassifiedListing = 30402;
var DraftClassifiedListing = 30403;
var Date2 = 31922;
var Time = 31923;
var Calendar = 31924;
var CalendarEventRSVP = 31925;
var RelayReview = 31987;
var Handlerrecommendation = 31989;
var Handlerinformation = 31990;
var CommunityDefinition = 34550;
var GroupMetadata = 39e3;
function matchFilter(filter, event) {
  if (filter.ids && filter.ids.indexOf(event.id) === -1) {
    return false;
  }
  if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
    return false;
  }
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
    return false;
  }
  for (let f in filter) {
    if (f[0] === "#") {
      let tagName = f.slice(1);
      let values = filter[`#${tagName}`];
      if (values && !event.tags.find(([t, v]) => t === f.slice(1) && values.indexOf(v) !== -1))
        return false;
    }
  }
  if (filter.since && event.created_at < filter.since)
    return false;
  if (filter.until && event.created_at > filter.until)
    return false;
  return true;
}
function matchFilters(filters, event) {
  for (let i2 = 0; i2 < filters.length; i2++) {
    if (matchFilter(filters[i2], event)) {
      return true;
    }
  }
  return false;
}
var fakejson_exports = {};
__export2(fakejson_exports, {
  getHex64: () => getHex64,
  getInt: () => getInt,
  getSubscriptionId: () => getSubscriptionId,
  matchEventId: () => matchEventId,
  matchEventKind: () => matchEventKind,
  matchEventPubkey: () => matchEventPubkey
});
function getHex64(json, field) {
  let len = field.length + 3;
  let idx = json.indexOf(`"${field}":`) + len;
  let s = json.slice(idx).indexOf(`"`) + idx + 1;
  return json.slice(s, s + 64);
}
function getInt(json, field) {
  let len = field.length;
  let idx = json.indexOf(`"${field}":`) + len + 3;
  let sliced = json.slice(idx);
  let end = Math.min(sliced.indexOf(","), sliced.indexOf("}"));
  return parseInt(sliced.slice(0, end), 10);
}
function getSubscriptionId(json) {
  let idx = json.slice(0, 22).indexOf(`"EVENT"`);
  if (idx === -1)
    return null;
  let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
  if (pstart === -1)
    return null;
  let start = idx + 7 + 1 + pstart;
  let pend = json.slice(start + 1, 80).indexOf(`"`);
  if (pend === -1)
    return null;
  let end = start + 1 + pend;
  return json.slice(start + 1, end);
}
function matchEventId(json, id) {
  return id === getHex64(json, "id");
}
function matchEventPubkey(json, pubkey) {
  return pubkey === getHex64(json, "pubkey");
}
function matchEventKind(json, kind) {
  return kind === getInt(json, "kind");
}
var nip42_exports = {};
__export2(nip42_exports, {
  makeAuthEvent: () => makeAuthEvent
});
function makeAuthEvent(relayURL, challenge3) {
  return {
    kind: ClientAuth,
    created_at: Math.floor(Date.now() / 1e3),
    tags: [
      ["relay", relayURL],
      ["challenge", challenge3]
    ],
    content: ""
  };
}
var _WebSocket;
try {
  _WebSocket = WebSocket;
} catch {
}
var _WebSocket2;
try {
  _WebSocket2 = WebSocket;
} catch {
}
var nip19_exports = {};
__export2(nip19_exports, {
  BECH32_REGEX: () => BECH32_REGEX,
  Bech32MaxSize: () => Bech32MaxSize,
  NostrTypeGuard: () => NostrTypeGuard,
  decode: () => decode,
  decodeNostrURI: () => decodeNostrURI,
  encodeBytes: () => encodeBytes,
  naddrEncode: () => naddrEncode,
  neventEncode: () => neventEncode,
  noteEncode: () => noteEncode,
  nprofileEncode: () => nprofileEncode,
  npubEncode: () => npubEncode,
  nsecEncode: () => nsecEncode
});
var NostrTypeGuard = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
};
var Bech32MaxSize = 5e3;
var BECH32_REGEX = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function integerToUint8Array(number) {
  const uint8Array = new Uint8Array(4);
  uint8Array[0] = number >> 24 & 255;
  uint8Array[1] = number >> 16 & 255;
  uint8Array[2] = number >> 8 & 255;
  uint8Array[3] = number & 255;
  return uint8Array;
}
function decodeNostrURI(nip19code) {
  try {
    if (nip19code.startsWith("nostr:"))
      nip19code = nip19code.substring(6);
    return decode(nip19code);
  } catch (_err) {
    return { type: "invalid", data: null };
  }
}
function decode(code) {
  let { prefix, words } = bech32.decode(code, Bech32MaxSize);
  let data = new Uint8Array(bech32.fromWords(words));
  switch (prefix) {
    case "nprofile": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder.decode(d4)) : []
        }
      };
    }
    case "nevent": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (tlv[2] && tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (tlv[3] && tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder.decode(d4)) : [],
          author: tlv[2]?.[0] ? bytesToHex(tlv[2][0]) : void 0,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex(tlv[3][0]), 16) : void 0
        }
      };
    }
    case "naddr": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!tlv[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!tlv[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: utf8Decoder.decode(tlv[0][0]),
          pubkey: bytesToHex(tlv[2][0]),
          kind: parseInt(bytesToHex(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder.decode(d4)) : []
        }
      };
    }
    case "nsec":
      return { type: prefix, data };
    case "npub":
    case "note":
      return { type: prefix, data: bytesToHex(data) };
    default:
      throw new Error(`unknown prefix ${prefix}`);
  }
}
function parseTLV(data) {
  let result = {};
  let rest = data;
  while (rest.length > 0) {
    let t = rest[0];
    let l = rest[1];
    let v = rest.slice(2, 2 + l);
    rest = rest.slice(2 + l);
    if (v.length < l)
      throw new Error(`not enough data to read on TLV ${t}`);
    result[t] = result[t] || [];
    result[t].push(v);
  }
  return result;
}
function nsecEncode(key) {
  return encodeBytes("nsec", key);
}
function npubEncode(hex) {
  return encodeBytes("npub", hexToBytes(hex));
}
function noteEncode(hex) {
  return encodeBytes("note", hexToBytes(hex));
}
function encodeBech32(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize);
}
function encodeBytes(prefix, bytes) {
  return encodeBech32(prefix, bytes);
}
function nprofileEncode(profile) {
  let data = encodeTLV({
    0: [hexToBytes(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
  });
  return encodeBech32("nprofile", data);
}
function neventEncode(event) {
  let kindArray;
  if (event.kind !== void 0) {
    kindArray = integerToUint8Array(event.kind);
  }
  let data = encodeTLV({
    0: [hexToBytes(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
    2: event.author ? [hexToBytes(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  });
  return encodeBech32("nevent", data);
}
function naddrEncode(addr) {
  let kind = new ArrayBuffer(4);
  new DataView(kind).setUint32(0, addr.kind, false);
  let data = encodeTLV({
    0: [utf8Encoder.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
    2: [hexToBytes(addr.pubkey)],
    3: [new Uint8Array(kind)]
  });
  return encodeBech32("naddr", data);
}
function encodeTLV(tlv) {
  let entries = [];
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      let entry = new Uint8Array(v.length + 2);
      entry.set([parseInt(t)], 0);
      entry.set([v.length], 1);
      entry.set(v, 2);
      entries.push(entry);
    });
  });
  return concatBytes(...entries);
}
var nip04_exports = {};
__export2(nip04_exports, {
  decrypt: () => decrypt2,
  encrypt: () => encrypt2
});
function encrypt2(secretKey, pubkey, text) {
  const privkey = secretKey instanceof Uint8Array ? secretKey : hexToBytes(secretKey);
  const key = secp256k1.getSharedSecret(privkey, hexToBytes("02" + pubkey));
  const normalizedKey = getNormalizedX(key);
  let iv = Uint8Array.from(randomBytes(16));
  let plaintext = utf8Encoder.encode(text);
  let ciphertext = cbc(normalizedKey, iv).encrypt(plaintext);
  let ctb64 = base64.encode(new Uint8Array(ciphertext));
  let ivb64 = base64.encode(new Uint8Array(iv.buffer));
  return `${ctb64}?iv=${ivb64}`;
}
function decrypt2(secretKey, pubkey, data) {
  const privkey = secretKey instanceof Uint8Array ? secretKey : hexToBytes(secretKey);
  let [ctb64, ivb64] = data.split("?iv=");
  let key = secp256k1.getSharedSecret(privkey, hexToBytes("02" + pubkey));
  let normalizedKey = getNormalizedX(key);
  let iv = base64.decode(ivb64);
  let ciphertext = base64.decode(ctb64);
  let plaintext = cbc(normalizedKey, iv).decrypt(ciphertext);
  return utf8Decoder.decode(plaintext);
}
function getNormalizedX(key) {
  return key.slice(1, 33);
}
var nip05_exports = {};
__export2(nip05_exports, {
  NIP05_REGEX: () => NIP05_REGEX,
  isNip05: () => isNip05,
  isValid: () => isValid,
  queryProfile: () => queryProfile,
  searchDomain: () => searchDomain,
  useFetchImplementation: () => useFetchImplementation
});
var NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/;
var isNip05 = (value) => NIP05_REGEX.test(value || "");
var _fetch;
try {
  _fetch = fetch;
} catch (_) {
  null;
}
function useFetchImplementation(fetchImplementation) {
  _fetch = fetchImplementation;
}
async function searchDomain(domain, query = "") {
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${query}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    return json.names;
  } catch (_) {
    return {};
  }
}
async function queryProfile(fullname) {
  const match = fullname.match(NIP05_REGEX);
  if (!match)
    return null;
  const [, name = "_", domain] = match;
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    const pubkey = json.names[name];
    return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null;
  } catch (_e) {
    return null;
  }
}
async function isValid(pubkey, nip05) {
  const res = await queryProfile(nip05);
  return res ? res.pubkey === pubkey : false;
}
var nip10_exports = {};
__export2(nip10_exports, {
  parse: () => parse
});
function parse(event) {
  const result = {
    reply: void 0,
    root: void 0,
    mentions: [],
    profiles: [],
    quotes: []
  };
  let maybeParent;
  let maybeRoot;
  for (let i2 = event.tags.length - 1; i2 >= 0; i2--) {
    const tag = event.tags[i2];
    if (tag[0] === "e" && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl, eTagMarker, eTagAuthor] = tag;
      const eventPointer = {
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : [],
        author: eTagAuthor
      };
      if (eTagMarker === "root") {
        result.root = eventPointer;
        continue;
      }
      if (eTagMarker === "reply") {
        result.reply = eventPointer;
        continue;
      }
      if (eTagMarker === "mention") {
        result.mentions.push(eventPointer);
        continue;
      }
      if (!maybeParent) {
        maybeParent = eventPointer;
      } else {
        maybeRoot = eventPointer;
      }
      result.mentions.push(eventPointer);
      continue;
    }
    if (tag[0] === "q" && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl] = tag;
      result.quotes.push({
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : []
      });
    }
    if (tag[0] === "p" && tag[1]) {
      result.profiles.push({
        pubkey: tag[1],
        relays: tag[2] ? [tag[2]] : []
      });
      continue;
    }
  }
  if (!result.root) {
    result.root = maybeRoot || maybeParent || result.reply;
  }
  if (!result.reply) {
    result.reply = maybeParent || result.root;
  }
  ;
  [result.reply, result.root].forEach((ref) => {
    if (!ref)
      return;
    let idx = result.mentions.indexOf(ref);
    if (idx !== -1) {
      result.mentions.splice(idx, 1);
    }
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays?.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  result.mentions.forEach((ref) => {
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  return result;
}
var nip11_exports = {};
__export2(nip11_exports, {
  fetchRelayInformation: () => fetchRelayInformation,
  useFetchImplementation: () => useFetchImplementation2
});
var _fetch2;
try {
  _fetch2 = fetch;
} catch {
}
function useFetchImplementation2(fetchImplementation) {
  _fetch2 = fetchImplementation;
}
async function fetchRelayInformation(url) {
  return await (await fetch(url.replace("ws://", "http://").replace("wss://", "https://"), {
    headers: { Accept: "application/nostr+json" }
  })).json();
}
var nip13_exports = {};
__export2(nip13_exports, {
  getPow: () => getPow,
  minePow: () => minePow
});
function getPow(hex) {
  let count = 0;
  for (let i2 = 0; i2 < 64; i2 += 8) {
    const nibble = parseInt(hex.substring(i2, i2 + 8), 16);
    if (nibble === 0) {
      count += 32;
    } else {
      count += Math.clz32(nibble);
      break;
    }
  }
  return count;
}
function getPowFromBytes(hash) {
  let count = 0;
  for (let i2 = 0; i2 < hash.length; i2++) {
    const byte = hash[i2];
    if (byte === 0) {
      count += 8;
    } else {
      count += Math.clz32(byte) - 24;
      break;
    }
  }
  return count;
}
function minePow(unsigned, difficulty) {
  let count = 0;
  const event = unsigned;
  const tag = ["nonce", count.toString(), difficulty.toString()];
  event.tags.push(tag);
  while (true) {
    const now2 = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
    if (now2 !== event.created_at) {
      count = 0;
      event.created_at = now2;
    }
    tag[1] = (++count).toString();
    const hash = sha256(
      utf8Encoder.encode(JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]))
    );
    if (getPowFromBytes(hash) >= difficulty) {
      event.id = bytesToHex(hash);
      break;
    }
  }
  return event;
}
var nip17_exports = {};
__export2(nip17_exports, {
  unwrapEvent: () => unwrapEvent2,
  unwrapManyEvents: () => unwrapManyEvents2,
  wrapEvent: () => wrapEvent2,
  wrapManyEvents: () => wrapManyEvents2
});
var nip59_exports = {};
__export2(nip59_exports, {
  createRumor: () => createRumor,
  createSeal: () => createSeal,
  createWrap: () => createWrap,
  unwrapEvent: () => unwrapEvent,
  unwrapManyEvents: () => unwrapManyEvents,
  wrapEvent: () => wrapEvent,
  wrapManyEvents: () => wrapManyEvents
});
var nip44_exports = {};
__export2(nip44_exports, {
  decrypt: () => decrypt22,
  encrypt: () => encrypt22,
  getConversationKey: () => getConversationKey,
  v2: () => v2
});
var minPlaintextSize = 1;
var maxPlaintextSize = 65535;
function getConversationKey(privkeyA, pubkeyB) {
  const sharedX = secp256k1.getSharedSecret(privkeyA, hexToBytes("02" + pubkeyB)).subarray(1, 33);
  return extract(sha256, sharedX, utf8Encoder.encode("nip44-v2"));
}
function getMessageKeys(conversationKey, nonce) {
  const keys = expand(sha256, conversationKey, nonce, 76);
  return {
    chacha_key: keys.subarray(0, 32),
    chacha_nonce: keys.subarray(32, 44),
    hmac_key: keys.subarray(44, 76)
  };
}
function calcPaddedLen(len) {
  if (!Number.isSafeInteger(len) || len < 1)
    throw new Error("expected positive integer");
  if (len <= 32)
    return 32;
  const nextPower = 1 << Math.floor(Math.log2(len - 1)) + 1;
  const chunk = nextPower <= 256 ? 32 : nextPower / 8;
  return chunk * (Math.floor((len - 1) / chunk) + 1);
}
function writeU16BE(num3) {
  if (!Number.isSafeInteger(num3) || num3 < minPlaintextSize || num3 > maxPlaintextSize)
    throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
  const arr = new Uint8Array(2);
  new DataView(arr.buffer).setUint16(0, num3, false);
  return arr;
}
function pad(plaintext) {
  const unpadded = utf8Encoder.encode(plaintext);
  const unpaddedLen = unpadded.length;
  const prefix = writeU16BE(unpaddedLen);
  const suffix = new Uint8Array(calcPaddedLen(unpaddedLen) - unpaddedLen);
  return concatBytes(prefix, unpadded, suffix);
}
function unpad(padded) {
  const unpaddedLen = new DataView(padded.buffer).getUint16(0);
  const unpadded = padded.subarray(2, 2 + unpaddedLen);
  if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize || unpadded.length !== unpaddedLen || padded.length !== 2 + calcPaddedLen(unpaddedLen))
    throw new Error("invalid padding");
  return utf8Decoder.decode(unpadded);
}
function hmacAad(key, message, aad) {
  if (aad.length !== 32)
    throw new Error("AAD associated data must be 32 bytes");
  const combined = concatBytes(aad, message);
  return hmac(sha256, key, combined);
}
function decodePayload(payload) {
  if (typeof payload !== "string")
    throw new Error("payload must be a valid string");
  const plen = payload.length;
  if (plen < 132 || plen > 87472)
    throw new Error("invalid payload length: " + plen);
  if (payload[0] === "#")
    throw new Error("unknown encryption version");
  let data;
  try {
    data = base64.decode(payload);
  } catch (error) {
    throw new Error("invalid base64: " + error.message);
  }
  const dlen = data.length;
  if (dlen < 99 || dlen > 65603)
    throw new Error("invalid data length: " + dlen);
  const vers = data[0];
  if (vers !== 2)
    throw new Error("unknown encryption version " + vers);
  return {
    nonce: data.subarray(1, 33),
    ciphertext: data.subarray(33, -32),
    mac: data.subarray(-32)
  };
}
function encrypt22(plaintext, conversationKey, nonce = randomBytes(32)) {
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const padded = pad(plaintext);
  const ciphertext = chacha20(chacha_key, chacha_nonce, padded);
  const mac = hmacAad(hmac_key, ciphertext, nonce);
  return base64.encode(concatBytes(new Uint8Array([2]), nonce, ciphertext, mac));
}
function decrypt22(payload, conversationKey) {
  const { nonce, ciphertext, mac } = decodePayload(payload);
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const calculatedMac = hmacAad(hmac_key, ciphertext, nonce);
  if (!equalBytes(calculatedMac, mac))
    throw new Error("invalid MAC");
  const padded = chacha20(chacha_key, chacha_nonce, ciphertext);
  return unpad(padded);
}
var v2 = {
  utils: {
    getConversationKey,
    calcPaddedLen
  },
  encrypt: encrypt22,
  decrypt: decrypt22
};
var TWO_DAYS = 2 * 24 * 60 * 60;
var now = () => Math.round(Date.now() / 1e3);
var randomNow = () => Math.round(now() - Math.random() * TWO_DAYS);
var nip44ConversationKey = (privateKey, publicKey) => getConversationKey(privateKey, publicKey);
var nip44Encrypt = (data, privateKey, publicKey) => encrypt22(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey));
var nip44Decrypt = (data, privateKey) => JSON.parse(decrypt22(data.content, nip44ConversationKey(privateKey, data.pubkey)));
function createRumor(event, privateKey) {
  const rumor = {
    created_at: now(),
    content: "",
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey)
  };
  rumor.id = getEventHash(rumor);
  return rumor;
}
function createSeal(rumor, privateKey, recipientPublicKey) {
  return finalizeEvent(
    {
      kind: Seal,
      content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
      created_at: randomNow(),
      tags: []
    },
    privateKey
  );
}
function createWrap(seal, recipientPublicKey) {
  const randomKey = generateSecretKey();
  return finalizeEvent(
    {
      kind: GiftWrap,
      content: nip44Encrypt(seal, randomKey, recipientPublicKey),
      created_at: randomNow(),
      tags: [["p", recipientPublicKey]]
    },
    randomKey
  );
}
function wrapEvent(event, senderPrivateKey, recipientPublicKey) {
  const rumor = createRumor(event, senderPrivateKey);
  const seal = createSeal(rumor, senderPrivateKey, recipientPublicKey);
  return createWrap(seal, recipientPublicKey);
}
function wrapManyEvents(event, senderPrivateKey, recipientsPublicKeys) {
  if (!recipientsPublicKeys || recipientsPublicKeys.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  const wrappeds = [wrapEvent(event, senderPrivateKey, senderPublicKey)];
  recipientsPublicKeys.forEach((recipientPublicKey) => {
    wrappeds.push(wrapEvent(event, senderPrivateKey, recipientPublicKey));
  });
  return wrappeds;
}
function unwrapEvent(wrap, recipientPrivateKey) {
  const unwrappedSeal = nip44Decrypt(wrap, recipientPrivateKey);
  return nip44Decrypt(unwrappedSeal, recipientPrivateKey);
}
function unwrapManyEvents(wrappedEvents, recipientPrivateKey) {
  let unwrappedEvents = [];
  wrappedEvents.forEach((e) => {
    unwrappedEvents.push(unwrapEvent(e, recipientPrivateKey));
  });
  unwrappedEvents.sort((a, b) => a.created_at - b.created_at);
  return unwrappedEvents;
}
function createEvent(recipients, message, conversationTitle, replyTo) {
  const baseEvent = {
    created_at: Math.ceil(Date.now() / 1e3),
    kind: PrivateDirectMessage,
    tags: [],
    content: message
  };
  const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
  recipientsArray.forEach(({ publicKey, relayUrl }) => {
    baseEvent.tags.push(relayUrl ? ["p", publicKey, relayUrl] : ["p", publicKey]);
  });
  if (replyTo) {
    baseEvent.tags.push(["e", replyTo.eventId, replyTo.relayUrl || "", "reply"]);
  }
  if (conversationTitle) {
    baseEvent.tags.push(["subject", conversationTitle]);
  }
  return baseEvent;
}
function wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo) {
  const event = createEvent(recipient, message, conversationTitle, replyTo);
  return wrapEvent(event, senderPrivateKey, recipient.publicKey);
}
function wrapManyEvents2(senderPrivateKey, recipients, message, conversationTitle, replyTo) {
  if (!recipients || recipients.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  return [{ publicKey: senderPublicKey }, ...recipients].map(
    (recipient) => wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo)
  );
}
var unwrapEvent2 = unwrapEvent;
var unwrapManyEvents2 = unwrapManyEvents;
var nip18_exports = {};
__export2(nip18_exports, {
  finishRepostEvent: () => finishRepostEvent,
  getRepostedEvent: () => getRepostedEvent,
  getRepostedEventPointer: () => getRepostedEventPointer
});
function finishRepostEvent(t, reposted, relayUrl, privateKey) {
  let kind;
  const tags = [...t.tags ?? [], ["e", reposted.id, relayUrl], ["p", reposted.pubkey]];
  if (reposted.kind === ShortTextNote) {
    kind = Repost;
  } else {
    kind = GenericRepost;
    tags.push(["k", String(reposted.kind)]);
  }
  return finalizeEvent(
    {
      kind,
      tags,
      content: t.content === "" || reposted.tags?.find((tag) => tag[0] === "-") ? "" : JSON.stringify(reposted),
      created_at: t.created_at
    },
    privateKey
  );
}
function getRepostedEventPointer(event) {
  if (![Repost, GenericRepost].includes(event.kind)) {
    return void 0;
  }
  let lastETag;
  let lastPTag;
  for (let i2 = event.tags.length - 1; i2 >= 0 && (lastETag === void 0 || lastPTag === void 0); i2--) {
    const tag = event.tags[i2];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === void 0) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === void 0) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === void 0) {
    return void 0;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag?.[2]].filter((x) => typeof x === "string"),
    author: lastPTag?.[1]
  };
}
function getRepostedEvent(event, { skipVerification } = {}) {
  const pointer = getRepostedEventPointer(event);
  if (pointer === void 0 || event.content === "") {
    return void 0;
  }
  let repostedEvent;
  try {
    repostedEvent = JSON.parse(event.content);
  } catch (error) {
    return void 0;
  }
  if (repostedEvent.id !== pointer.id) {
    return void 0;
  }
  if (!skipVerification && !verifyEvent(repostedEvent)) {
    return void 0;
  }
  return repostedEvent;
}
var nip21_exports = {};
__export2(nip21_exports, {
  NOSTR_URI_REGEX: () => NOSTR_URI_REGEX,
  parse: () => parse2,
  test: () => test
});
var NOSTR_URI_REGEX = new RegExp(`nostr:(${BECH32_REGEX.source})`);
function test(value) {
  return typeof value === "string" && new RegExp(`^${NOSTR_URI_REGEX.source}$`).test(value);
}
function parse2(uri) {
  const match = uri.match(new RegExp(`^${NOSTR_URI_REGEX.source}$`));
  if (!match)
    throw new Error(`Invalid Nostr URI: ${uri}`);
  return {
    uri: match[0],
    value: match[1],
    decoded: decode(match[1])
  };
}
var nip25_exports = {};
__export2(nip25_exports, {
  finishReactionEvent: () => finishReactionEvent,
  getReactedEventPointer: () => getReactedEventPointer
});
function finishReactionEvent(t, reacted, privateKey) {
  const inheritedTags = reacted.tags.filter((tag) => tag.length >= 2 && (tag[0] === "e" || tag[0] === "p"));
  return finalizeEvent(
    {
      ...t,
      kind: Reaction,
      tags: [...t.tags ?? [], ...inheritedTags, ["e", reacted.id], ["p", reacted.pubkey]],
      content: t.content ?? "+"
    },
    privateKey
  );
}
function getReactedEventPointer(event) {
  if (event.kind !== Reaction) {
    return void 0;
  }
  let lastETag;
  let lastPTag;
  for (let i2 = event.tags.length - 1; i2 >= 0 && (lastETag === void 0 || lastPTag === void 0); i2--) {
    const tag = event.tags[i2];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === void 0) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === void 0) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === void 0 || lastPTag === void 0) {
    return void 0;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag[2]].filter((x) => x !== void 0),
    author: lastPTag[1]
  };
}
var nip27_exports = {};
__export2(nip27_exports, {
  parse: () => parse3
});
var noCharacter = /\W/m;
var noURLCharacter = /[^\w\/] |[^\w\/]$|$|,| /m;
var MAX_HASHTAG_LENGTH = 42;
function* parse3(content) {
  let emojis = [];
  if (typeof content !== "string") {
    for (let i2 = 0; i2 < content.tags.length; i2++) {
      const tag = content.tags[i2];
      if (tag[0] === "emoji" && tag.length >= 3) {
        emojis.push({ type: "emoji", shortcode: tag[1], url: tag[2] });
      }
    }
    content = content.content;
  }
  const max = content.length;
  let prevIndex = 0;
  let index = 0;
  mainloop:
    while (index < max) {
      const u = content.indexOf(":", index);
      const h = content.indexOf("#", index);
      if (u === -1 && h === -1) {
        break mainloop;
      }
      if (u === -1 || h >= 0 && h < u) {
        if (h === 0 || content[h - 1].match(noCharacter)) {
          const m = content.slice(h + 1, h + MAX_HASHTAG_LENGTH).match(noCharacter);
          const end = m ? h + 1 + m.index : max;
          yield { type: "text", text: content.slice(prevIndex, h) };
          yield { type: "hashtag", value: content.slice(h + 1, end) };
          index = end;
          prevIndex = index;
          continue mainloop;
        }
        index = h + 1;
        continue mainloop;
      }
      if (content.slice(u - 5, u) === "nostr") {
        const m = content.slice(u + 60).match(noCharacter);
        const end = m ? u + 60 + m.index : max;
        try {
          let pointer;
          let { data, type } = decode(content.slice(u + 1, end));
          switch (type) {
            case "npub":
              pointer = { pubkey: data };
              break;
            case "note":
              pointer = { id: data };
              break;
            case "nsec":
              index = end + 1;
              continue;
            default:
              pointer = data;
          }
          if (prevIndex !== u - 5) {
            yield { type: "text", text: content.slice(prevIndex, u - 5) };
          }
          yield { type: "reference", pointer };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = u + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 5, u) === "https" || content.slice(u - 4, u) === "http") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max;
        const prefixLen = content[u - 1] === "s" ? 5 : 4;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid url");
          }
          if (prevIndex !== u - prefixLen) {
            yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
          }
          if (/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(url.pathname)) {
            yield { type: "image", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp4|avi|webm|mkv|mov)$/i.test(url.pathname)) {
            yield { type: "video", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(url.pathname)) {
            yield { type: "audio", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          yield { type: "url", url: url.toString() };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 3, u) === "wss" || content.slice(u - 2, u) === "ws") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max;
        const prefixLen = content[u - 1] === "s" ? 3 : 2;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid ws url");
          }
          if (prevIndex !== u - prefixLen) {
            yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
          }
          yield { type: "relay", url: url.toString() };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else {
        for (let e = 0; e < emojis.length; e++) {
          const emoji = emojis[e];
          if (content[u + emoji.shortcode.length + 1] === ":" && content.slice(u + 1, u + emoji.shortcode.length + 1) === emoji.shortcode) {
            if (prevIndex !== u) {
              yield { type: "text", text: content.slice(prevIndex, u) };
            }
            yield emoji;
            index = u + emoji.shortcode.length + 2;
            prevIndex = index;
            continue mainloop;
          }
        }
        index = u + 1;
        continue mainloop;
      }
    }
  if (prevIndex !== max) {
    yield { type: "text", text: content.slice(prevIndex) };
  }
}
var nip28_exports = {};
__export2(nip28_exports, {
  channelCreateEvent: () => channelCreateEvent,
  channelHideMessageEvent: () => channelHideMessageEvent,
  channelMessageEvent: () => channelMessageEvent,
  channelMetadataEvent: () => channelMetadataEvent,
  channelMuteUserEvent: () => channelMuteUserEvent
});
var channelCreateEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelCreation,
      tags: [...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMetadataEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelMetadata,
      tags: [["e", t.channel_create_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMessageEvent = (t, privateKey) => {
  const tags = [["e", t.channel_create_event_id, t.relay_url, "root"]];
  if (t.reply_to_channel_message_event_id) {
    tags.push(["e", t.reply_to_channel_message_event_id, t.relay_url, "reply"]);
  }
  return finalizeEvent(
    {
      kind: ChannelMessage,
      tags: [...tags, ...t.tags ?? []],
      content: t.content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelHideMessageEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelHideMessage,
      tags: [["e", t.channel_message_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMuteUserEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelMuteUser,
      tags: [["p", t.pubkey_to_mute], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var nip30_exports = {};
__export2(nip30_exports, {
  EMOJI_SHORTCODE_REGEX: () => EMOJI_SHORTCODE_REGEX,
  matchAll: () => matchAll,
  regex: () => regex,
  replaceAll: () => replaceAll
});
var EMOJI_SHORTCODE_REGEX = /:(\w+):/;
var regex = () => new RegExp(`\\B${EMOJI_SHORTCODE_REGEX.source}\\B`, "g");
function* matchAll(content) {
  const matches = content.matchAll(regex());
  for (const match of matches) {
    try {
      const [shortcode, name] = match;
      yield {
        shortcode,
        name,
        start: match.index,
        end: match.index + shortcode.length
      };
    } catch (_e) {
    }
  }
}
function replaceAll(content, replacer) {
  return content.replaceAll(regex(), (shortcode, name) => {
    return replacer({
      shortcode,
      name
    });
  });
}
var nip39_exports = {};
__export2(nip39_exports, {
  useFetchImplementation: () => useFetchImplementation3,
  validateGithub: () => validateGithub
});
var _fetch3;
try {
  _fetch3 = fetch;
} catch {
}
function useFetchImplementation3(fetchImplementation) {
  _fetch3 = fetchImplementation;
}
async function validateGithub(pubkey, username, proof) {
  try {
    let res = await (await _fetch3(`https://gist.github.com/${username}/${proof}/raw`)).text();
    return res === `Verifying that I control the following Nostr public key: ${pubkey}`;
  } catch (_) {
    return false;
  }
}
var nip47_exports = {};
__export2(nip47_exports, {
  makeNwcRequestEvent: () => makeNwcRequestEvent,
  parseConnectionString: () => parseConnectionString
});
function parseConnectionString(connectionString) {
  const { host, pathname, searchParams } = new URL(connectionString);
  const pubkey = pathname || host;
  const relay = searchParams.get("relay");
  const secret = searchParams.get("secret");
  if (!pubkey || !relay || !secret) {
    throw new Error("invalid connection string");
  }
  return { pubkey, relay, secret };
}
async function makeNwcRequestEvent(pubkey, secretKey, invoice) {
  const content = {
    method: "pay_invoice",
    params: {
      invoice
    }
  };
  const encryptedContent = encrypt2(secretKey, pubkey, JSON.stringify(content));
  const eventTemplate = {
    kind: NWCWalletRequest,
    created_at: Math.round(Date.now() / 1e3),
    content: encryptedContent,
    tags: [["p", pubkey]]
  };
  return finalizeEvent(eventTemplate, secretKey);
}
var nip54_exports = {};
__export2(nip54_exports, {
  normalizeIdentifier: () => normalizeIdentifier
});
function normalizeIdentifier(name) {
  name = name.trim().toLowerCase();
  name = name.normalize("NFKC");
  return Array.from(name).map((char) => {
    if (/\p{Letter}/u.test(char) || /\p{Number}/u.test(char)) {
      return char;
    }
    return "-";
  }).join("");
}
var nip57_exports = {};
__export2(nip57_exports, {
  getSatoshisAmountFromBolt11: () => getSatoshisAmountFromBolt11,
  getZapEndpoint: () => getZapEndpoint,
  makeZapReceipt: () => makeZapReceipt,
  makeZapRequest: () => makeZapRequest,
  useFetchImplementation: () => useFetchImplementation4,
  validateZapRequest: () => validateZapRequest
});
var _fetch4;
try {
  _fetch4 = fetch;
} catch {
}
function useFetchImplementation4(fetchImplementation) {
  _fetch4 = fetchImplementation;
}
async function getZapEndpoint(metadata) {
  try {
    let lnurl = "";
    let { lud06, lud16 } = JSON.parse(metadata.content);
    if (lud16) {
      let [name, domain] = lud16.split("@");
      lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString();
    } else if (lud06) {
      let { words } = bech32.decode(lud06, 1e3);
      let data = bech32.fromWords(words);
      lnurl = utf8Decoder.decode(data);
    } else {
      return null;
    }
    let res = await _fetch4(lnurl);
    let body = await res.json();
    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback;
    }
  } catch (err) {
  }
  return null;
}
function makeZapRequest(params) {
  let zr = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1e3),
    content: params.comment || "",
    tags: [
      ["p", "pubkey" in params ? params.pubkey : params.event.pubkey],
      ["amount", params.amount.toString()],
      ["relays", ...params.relays]
    ]
  };
  if ("event" in params) {
    zr.tags.push(["e", params.event.id]);
    if (isReplaceableKind(params.event.kind)) {
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:`];
      zr.tags.push(a);
    } else if (isAddressableKind(params.event.kind)) {
      let d4 = params.event.tags.find(([t, v]) => t === "d" && v);
      if (!d4)
        throw new Error("d tag not found or is empty");
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:${d4[1]}`];
      zr.tags.push(a);
    }
    zr.tags.push(["k", params.event.kind.toString()]);
  }
  return zr;
}
function validateZapRequest(zapRequestString) {
  let zapRequest;
  try {
    zapRequest = JSON.parse(zapRequestString);
  } catch (err) {
    return "Invalid zap request JSON.";
  }
  if (!validateEvent(zapRequest))
    return "Zap request is not a valid Nostr event.";
  if (!verifyEvent(zapRequest))
    return "Invalid signature on zap request.";
  let p = zapRequest.tags.find(([t, v]) => t === "p" && v);
  if (!p)
    return "Zap request doesn't have a 'p' tag.";
  if (!p[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'p' tag is not valid hex.";
  let e = zapRequest.tags.find(([t, v]) => t === "e" && v);
  if (e && !e[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'e' tag is not valid hex.";
  let relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
  if (!relays)
    return "Zap request doesn't have a 'relays' tag.";
  return null;
}
function makeZapReceipt({
  zapRequest,
  preimage,
  bolt11,
  paidAt
}) {
  let zr = JSON.parse(zapRequest);
  let tagsFromZapRequest = zr.tags.filter(([t]) => t === "e" || t === "p" || t === "a");
  let zap = {
    kind: 9735,
    created_at: Math.round(paidAt.getTime() / 1e3),
    content: "",
    tags: [...tagsFromZapRequest, ["P", zr.pubkey], ["bolt11", bolt11], ["description", zapRequest]]
  };
  if (preimage) {
    zap.tags.push(["preimage", preimage]);
  }
  return zap;
}
function getSatoshisAmountFromBolt11(bolt11) {
  if (bolt11.length < 50) {
    return 0;
  }
  bolt11 = bolt11.substring(0, 50);
  const idx = bolt11.lastIndexOf("1");
  if (idx === -1) {
    return 0;
  }
  const hrp = bolt11.substring(0, idx);
  if (!hrp.startsWith("lnbc")) {
    return 0;
  }
  const amount = hrp.substring(4);
  if (amount.length < 1) {
    return 0;
  }
  const char = amount[amount.length - 1];
  const digit = char.charCodeAt(0) - "0".charCodeAt(0);
  const isDigit = digit >= 0 && digit <= 9;
  let cutPoint = amount.length - 1;
  if (isDigit) {
    cutPoint++;
  }
  if (cutPoint < 1) {
    return 0;
  }
  const num3 = parseInt(amount.substring(0, cutPoint));
  switch (char) {
    case "m":
      return num3 * 1e5;
    case "u":
      return num3 * 100;
    case "n":
      return num3 / 10;
    case "p":
      return num3 / 1e4;
    default:
      return num3 * 1e8;
  }
}
var nip77_exports = {};
__export2(nip77_exports, {
  Negentropy: () => Negentropy,
  NegentropyStorageVector: () => NegentropyStorageVector,
  NegentropySync: () => NegentropySync
});
var PROTOCOL_VERSION = 97;
var ID_SIZE = 32;
var FINGERPRINT_SIZE = 16;
var Mode = {
  Skip: 0,
  Fingerprint: 1,
  IdList: 2
};
var WrappedBuffer = class {
  _raw;
  length;
  constructor(buffer) {
    if (typeof buffer === "number") {
      this._raw = new Uint8Array(buffer);
      this.length = 0;
    } else if (buffer instanceof Uint8Array) {
      this._raw = new Uint8Array(buffer);
      this.length = buffer.length;
    } else {
      this._raw = new Uint8Array(512);
      this.length = 0;
    }
  }
  unwrap() {
    return this._raw.subarray(0, this.length);
  }
  get capacity() {
    return this._raw.byteLength;
  }
  extend(buf) {
    if (buf instanceof WrappedBuffer)
      buf = buf.unwrap();
    if (typeof buf.length !== "number")
      throw Error("bad length");
    const targetSize = buf.length + this.length;
    if (this.capacity < targetSize) {
      const oldRaw = this._raw;
      const newCapacity = Math.max(this.capacity * 2, targetSize);
      this._raw = new Uint8Array(newCapacity);
      this._raw.set(oldRaw);
    }
    this._raw.set(buf, this.length);
    this.length += buf.length;
  }
  shift() {
    const first = this._raw[0];
    this._raw = this._raw.subarray(1);
    this.length--;
    return first;
  }
  shiftN(n = 1) {
    const firstSubarray = this._raw.subarray(0, n);
    this._raw = this._raw.subarray(n);
    this.length -= n;
    return firstSubarray;
  }
};
function decodeVarInt(buf) {
  let res = 0;
  while (1) {
    if (buf.length === 0)
      throw Error("parse ends prematurely");
    let byte = buf.shift();
    res = res << 7 | byte & 127;
    if ((byte & 128) === 0)
      break;
  }
  return res;
}
function encodeVarInt(n) {
  if (n === 0)
    return new WrappedBuffer(new Uint8Array([0]));
  let o = [];
  while (n !== 0) {
    o.push(n & 127);
    n >>>= 7;
  }
  o.reverse();
  for (let i2 = 0; i2 < o.length - 1; i2++)
    o[i2] |= 128;
  return new WrappedBuffer(new Uint8Array(o));
}
function getByte(buf) {
  return getBytes(buf, 1)[0];
}
function getBytes(buf, n) {
  if (buf.length < n)
    throw Error("parse ends prematurely");
  return buf.shiftN(n);
}
var Accumulator = class {
  buf;
  constructor() {
    this.setToZero();
  }
  setToZero() {
    this.buf = new Uint8Array(ID_SIZE);
  }
  add(otherBuf) {
    let currCarry = 0, nextCarry = 0;
    let p = new DataView(this.buf.buffer);
    let po = new DataView(otherBuf.buffer);
    for (let i2 = 0; i2 < 8; i2++) {
      let offset = i2 * 4;
      let orig = p.getUint32(offset, true);
      let otherV = po.getUint32(offset, true);
      let next = orig;
      next += currCarry;
      next += otherV;
      if (next > 4294967295)
        nextCarry = 1;
      p.setUint32(offset, next & 4294967295, true);
      currCarry = nextCarry;
      nextCarry = 0;
    }
  }
  negate() {
    let p = new DataView(this.buf.buffer);
    for (let i2 = 0; i2 < 8; i2++) {
      let offset = i2 * 4;
      p.setUint32(offset, ~p.getUint32(offset, true));
    }
    let one = new Uint8Array(ID_SIZE);
    one[0] = 1;
    this.add(one);
  }
  getFingerprint(n) {
    let input = new WrappedBuffer();
    input.extend(this.buf);
    input.extend(encodeVarInt(n));
    let hash = sha256(input.unwrap());
    return hash.subarray(0, FINGERPRINT_SIZE);
  }
};
var NegentropyStorageVector = class {
  items;
  sealed;
  constructor() {
    this.items = [];
    this.sealed = false;
  }
  insert(timestamp, id) {
    if (this.sealed)
      throw Error("already sealed");
    const idb = hexToBytes(id);
    if (idb.byteLength !== ID_SIZE)
      throw Error("bad id size for added item");
    this.items.push({ timestamp, id: idb });
  }
  seal() {
    if (this.sealed)
      throw Error("already sealed");
    this.sealed = true;
    this.items.sort(itemCompare);
    for (let i2 = 1; i2 < this.items.length; i2++) {
      if (itemCompare(this.items[i2 - 1], this.items[i2]) === 0)
        throw Error("duplicate item inserted");
    }
  }
  unseal() {
    this.sealed = false;
  }
  size() {
    this._checkSealed();
    return this.items.length;
  }
  getItem(i2) {
    this._checkSealed();
    if (i2 >= this.items.length)
      throw Error("out of range");
    return this.items[i2];
  }
  iterate(begin, end, cb) {
    this._checkSealed();
    this._checkBounds(begin, end);
    for (let i2 = begin; i2 < end; ++i2) {
      if (!cb(this.items[i2], i2))
        break;
    }
  }
  findLowerBound(begin, end, bound) {
    this._checkSealed();
    this._checkBounds(begin, end);
    return this._binarySearch(this.items, begin, end, (a) => itemCompare(a, bound) < 0);
  }
  fingerprint(begin, end) {
    let out = new Accumulator();
    out.setToZero();
    this.iterate(begin, end, (item) => {
      out.add(item.id);
      return true;
    });
    return out.getFingerprint(end - begin);
  }
  _checkSealed() {
    if (!this.sealed)
      throw Error("not sealed");
  }
  _checkBounds(begin, end) {
    if (begin > end || end > this.items.length)
      throw Error("bad range");
  }
  _binarySearch(arr, first, last, cmp) {
    let count = last - first;
    while (count > 0) {
      let it = first;
      let step = Math.floor(count / 2);
      it += step;
      if (cmp(arr[it])) {
        first = ++it;
        count -= step + 1;
      } else {
        count = step;
      }
    }
    return first;
  }
};
var Negentropy = class {
  storage;
  frameSizeLimit;
  lastTimestampIn;
  lastTimestampOut;
  constructor(storage, frameSizeLimit = 6e4) {
    if (frameSizeLimit < 4096)
      throw Error("frameSizeLimit too small");
    this.storage = storage;
    this.frameSizeLimit = frameSizeLimit;
    this.lastTimestampIn = 0;
    this.lastTimestampOut = 0;
  }
  _bound(timestamp, id) {
    return { timestamp, id: id || new Uint8Array(0) };
  }
  initiate() {
    let output = new WrappedBuffer();
    output.extend(new Uint8Array([PROTOCOL_VERSION]));
    this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), output);
    return bytesToHex(output.unwrap());
  }
  reconcile(queryMsg, onhave, onneed) {
    const query = new WrappedBuffer(hexToBytes(queryMsg));
    this.lastTimestampIn = this.lastTimestampOut = 0;
    let fullOutput = new WrappedBuffer();
    fullOutput.extend(new Uint8Array([PROTOCOL_VERSION]));
    let protocolVersion = getByte(query);
    if (protocolVersion < 96 || protocolVersion > 111)
      throw Error("invalid negentropy protocol version byte");
    if (protocolVersion !== PROTOCOL_VERSION) {
      throw Error("unsupported negentropy protocol version requested: " + (protocolVersion - 96));
    }
    let storageSize = this.storage.size();
    let prevBound = this._bound(0);
    let prevIndex = 0;
    let skip = false;
    while (query.length !== 0) {
      let o = new WrappedBuffer();
      let doSkip = () => {
        if (skip) {
          skip = false;
          o.extend(this.encodeBound(prevBound));
          o.extend(encodeVarInt(Mode.Skip));
        }
      };
      let currBound = this.decodeBound(query);
      let mode = decodeVarInt(query);
      let lower = prevIndex;
      let upper = this.storage.findLowerBound(prevIndex, storageSize, currBound);
      if (mode === Mode.Skip) {
        skip = true;
      } else if (mode === Mode.Fingerprint) {
        let theirFingerprint = getBytes(query, FINGERPRINT_SIZE);
        let ourFingerprint = this.storage.fingerprint(lower, upper);
        if (compareUint8Array(theirFingerprint, ourFingerprint) !== 0) {
          doSkip();
          this.splitRange(lower, upper, currBound, o);
        } else {
          skip = true;
        }
      } else if (mode === Mode.IdList) {
        let numIds = decodeVarInt(query);
        let theirElems = {};
        for (let i2 = 0; i2 < numIds; i2++) {
          let e = getBytes(query, ID_SIZE);
          theirElems[bytesToHex(e)] = e;
        }
        skip = true;
        this.storage.iterate(lower, upper, (item) => {
          let k = item.id;
          const id = bytesToHex(k);
          if (!theirElems[id]) {
            onhave?.(id);
          } else {
            delete theirElems[bytesToHex(k)];
          }
          return true;
        });
        if (onneed) {
          for (let v of Object.values(theirElems)) {
            onneed(bytesToHex(v));
          }
        }
      } else {
        throw Error("unexpected mode");
      }
      if (this.exceededFrameSizeLimit(fullOutput.length + o.length)) {
        let remainingFingerprint = this.storage.fingerprint(upper, storageSize);
        fullOutput.extend(this.encodeBound(this._bound(Number.MAX_VALUE)));
        fullOutput.extend(encodeVarInt(Mode.Fingerprint));
        fullOutput.extend(remainingFingerprint);
        break;
      } else {
        fullOutput.extend(o);
      }
      prevIndex = upper;
      prevBound = currBound;
    }
    return fullOutput.length === 1 ? null : bytesToHex(fullOutput.unwrap());
  }
  splitRange(lower, upper, upperBound, o) {
    let numElems = upper - lower;
    let buckets = 16;
    if (numElems < buckets * 2) {
      o.extend(this.encodeBound(upperBound));
      o.extend(encodeVarInt(Mode.IdList));
      o.extend(encodeVarInt(numElems));
      this.storage.iterate(lower, upper, (item) => {
        o.extend(item.id);
        return true;
      });
    } else {
      let itemsPerBucket = Math.floor(numElems / buckets);
      let bucketsWithExtra = numElems % buckets;
      let curr = lower;
      for (let i2 = 0; i2 < buckets; i2++) {
        let bucketSize = itemsPerBucket + (i2 < bucketsWithExtra ? 1 : 0);
        let ourFingerprint = this.storage.fingerprint(curr, curr + bucketSize);
        curr += bucketSize;
        let nextBound;
        if (curr === upper) {
          nextBound = upperBound;
        } else {
          let prevItem;
          let currItem;
          this.storage.iterate(curr - 1, curr + 1, (item, index) => {
            if (index === curr - 1)
              prevItem = item;
            else
              currItem = item;
            return true;
          });
          nextBound = this.getMinimalBound(prevItem, currItem);
        }
        o.extend(this.encodeBound(nextBound));
        o.extend(encodeVarInt(Mode.Fingerprint));
        o.extend(ourFingerprint);
      }
    }
  }
  exceededFrameSizeLimit(n) {
    return n > this.frameSizeLimit - 200;
  }
  decodeTimestampIn(encoded) {
    let timestamp = decodeVarInt(encoded);
    timestamp = timestamp === 0 ? Number.MAX_VALUE : timestamp - 1;
    if (this.lastTimestampIn === Number.MAX_VALUE || timestamp === Number.MAX_VALUE) {
      this.lastTimestampIn = Number.MAX_VALUE;
      return Number.MAX_VALUE;
    }
    timestamp += this.lastTimestampIn;
    this.lastTimestampIn = timestamp;
    return timestamp;
  }
  decodeBound(encoded) {
    let timestamp = this.decodeTimestampIn(encoded);
    let len = decodeVarInt(encoded);
    if (len > ID_SIZE)
      throw Error("bound key too long");
    let id = getBytes(encoded, len);
    return { timestamp, id };
  }
  encodeTimestampOut(timestamp) {
    if (timestamp === Number.MAX_VALUE) {
      this.lastTimestampOut = Number.MAX_VALUE;
      return encodeVarInt(0);
    }
    let temp = timestamp;
    timestamp -= this.lastTimestampOut;
    this.lastTimestampOut = temp;
    return encodeVarInt(timestamp + 1);
  }
  encodeBound(key) {
    let output = new WrappedBuffer();
    output.extend(this.encodeTimestampOut(key.timestamp));
    output.extend(encodeVarInt(key.id.length));
    output.extend(key.id);
    return output;
  }
  getMinimalBound(prev, curr) {
    if (curr.timestamp !== prev.timestamp) {
      return this._bound(curr.timestamp);
    } else {
      let sharedPrefixBytes = 0;
      let currKey = curr.id;
      let prevKey = prev.id;
      for (let i2 = 0; i2 < ID_SIZE; i2++) {
        if (currKey[i2] !== prevKey[i2])
          break;
        sharedPrefixBytes++;
      }
      return this._bound(curr.timestamp, curr.id.subarray(0, sharedPrefixBytes + 1));
    }
  }
};
function compareUint8Array(a, b) {
  for (let i2 = 0; i2 < a.byteLength; i2++) {
    if (a[i2] < b[i2])
      return -1;
    if (a[i2] > b[i2])
      return 1;
  }
  if (a.byteLength > b.byteLength)
    return 1;
  if (a.byteLength < b.byteLength)
    return -1;
  return 0;
}
function itemCompare(a, b) {
  if (a.timestamp === b.timestamp) {
    return compareUint8Array(a.id, b.id);
  }
  return a.timestamp - b.timestamp;
}
var NegentropySync = class {
  relay;
  storage;
  neg;
  filter;
  subscription;
  onhave;
  onneed;
  constructor(relay, storage, filter, params = {}) {
    this.relay = relay;
    this.storage = storage;
    this.neg = new Negentropy(storage);
    this.onhave = params.onhave;
    this.onneed = params.onneed;
    this.filter = filter;
    this.subscription = this.relay.prepareSubscription([{}], { label: params.label || "negentropy" });
    this.subscription.oncustom = (data) => {
      switch (data[0]) {
        case "NEG-MSG": {
          if (data.length < 3) {
            console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${data}`);
          }
          try {
            const response = this.neg.reconcile(data[2], this.onhave, this.onneed);
            if (response) {
              this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${response}"]`);
            } else {
              this.close();
              params.onclose?.();
            }
          } catch (error) {
            console.error("negentropy reconcile error:", error);
            params?.onclose?.(`reconcile error: ${error}`);
          }
          break;
        }
        case "NEG-CLOSE": {
          const reason = data[2];
          console.warn("negentropy error:", reason);
          params.onclose?.(reason);
          break;
        }
        case "NEG-ERR": {
          params.onclose?.();
        }
      }
    };
  }
  async start() {
    const initMsg = this.neg.initiate();
    this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${initMsg}"]`);
  }
  close() {
    this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`);
    this.subscription.close();
  }
};
var nip98_exports = {};
__export2(nip98_exports, {
  getToken: () => getToken,
  hashPayload: () => hashPayload,
  unpackEventFromToken: () => unpackEventFromToken,
  validateEvent: () => validateEvent2,
  validateEventKind: () => validateEventKind,
  validateEventMethodTag: () => validateEventMethodTag,
  validateEventPayloadTag: () => validateEventPayloadTag,
  validateEventTimestamp: () => validateEventTimestamp,
  validateEventUrlTag: () => validateEventUrlTag,
  validateToken: () => validateToken
});
var _authorizationScheme = "Nostr ";
async function getToken(loginUrl, httpMethod, sign, includeAuthorizationScheme = false, payload) {
  const event = {
    kind: HTTPAuth,
    tags: [
      ["u", loginUrl],
      ["method", httpMethod]
    ],
    created_at: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
    content: ""
  };
  if (payload) {
    event.tags.push(["payload", hashPayload(payload)]);
  }
  const signedEvent = await sign(event);
  const authorizationScheme = includeAuthorizationScheme ? _authorizationScheme : "";
  return authorizationScheme + base64.encode(utf8Encoder.encode(JSON.stringify(signedEvent)));
}
async function validateToken(token, url, method) {
  const event = await unpackEventFromToken(token).catch((error) => {
    throw error;
  });
  const valid = await validateEvent2(event, url, method).catch((error) => {
    throw error;
  });
  return valid;
}
async function unpackEventFromToken(token) {
  if (!token) {
    throw new Error("Missing token");
  }
  token = token.replace(_authorizationScheme, "");
  const eventB64 = utf8Decoder.decode(base64.decode(token));
  if (!eventB64 || eventB64.length === 0 || !eventB64.startsWith("{")) {
    throw new Error("Invalid token");
  }
  const event = JSON.parse(eventB64);
  return event;
}
function validateEventTimestamp(event) {
  if (!event.created_at) {
    return false;
  }
  return Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3) - event.created_at < 60;
}
function validateEventKind(event) {
  return event.kind === HTTPAuth;
}
function validateEventUrlTag(event, url) {
  const urlTag = event.tags.find((t) => t[0] === "u");
  if (!urlTag) {
    return false;
  }
  return urlTag.length > 0 && urlTag[1] === url;
}
function validateEventMethodTag(event, method) {
  const methodTag = event.tags.find((t) => t[0] === "method");
  if (!methodTag) {
    return false;
  }
  return methodTag.length > 0 && methodTag[1].toLowerCase() === method.toLowerCase();
}
function hashPayload(payload) {
  const hash = sha256(utf8Encoder.encode(JSON.stringify(payload)));
  return bytesToHex(hash);
}
function validateEventPayloadTag(event, payload) {
  const payloadTag = event.tags.find((t) => t[0] === "payload");
  if (!payloadTag) {
    return false;
  }
  const payloadHash = hashPayload(payload);
  return payloadTag.length > 0 && payloadTag[1] === payloadHash;
}
async function validateEvent2(event, url, method, body) {
  if (!verifyEvent(event)) {
    throw new Error("Invalid nostr event, signature invalid");
  }
  if (!validateEventKind(event)) {
    throw new Error("Invalid nostr event, kind invalid");
  }
  if (!validateEventTimestamp(event)) {
    throw new Error("Invalid nostr event, created_at timestamp invalid");
  }
  if (!validateEventUrlTag(event, url)) {
    throw new Error("Invalid nostr event, url tag invalid");
  }
  if (!validateEventMethodTag(event, method)) {
    throw new Error("Invalid nostr event, method tag invalid");
  }
  if (Boolean(body) && typeof body === "object" && Object.keys(body).length > 0) {
    if (!validateEventPayloadTag(event, body)) {
      throw new Error("Invalid nostr event, payload tag does not match request body hash");
    }
  }
  return true;
}

// ../node_modules/@noble/hashes/esm/crypto.js
var crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;

// ../node_modules/@noble/hashes/esm/utils.js
function isBytes4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber4(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes4(b, ...lengths) {
  if (!isBytes4(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash2(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber4(h.outputLen);
  anumber4(h.blockLen);
}
function aexists3(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput3(out, instance) {
  abytes4(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean3(...arrays) {
  for (let i2 = 0; i2 < arrays.length; i2++) {
    arrays[i2].fill(0);
  }
}
function createView3(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr2(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin2 = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
function bytesToHex3(bytes) {
  abytes4(bytes);
  if (hasHexBuiltin2)
    return bytes.toHex();
  let hex = "";
  for (let i2 = 0; i2 < bytes.length; i2++) {
    hex += hexes2[bytes[i2]];
  }
  return hex;
}
var asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase162(ch) {
  if (ch >= asciis2._0 && ch <= asciis2._9)
    return ch - asciis2._0;
  if (ch >= asciis2.A && ch <= asciis2.F)
    return ch - (asciis2.A - 10);
  if (ch >= asciis2.a && ch <= asciis2.f)
    return ch - (asciis2.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin2)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase162(hex.charCodeAt(hi));
    const n2 = asciiToBase162(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes2(data);
  abytes4(data);
  return data;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i2 = 0; i2 < arrays.length; i2++) {
    const a = arrays[i2];
    abytes4(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i2 = 0, pad2 = 0; i2 < arrays.length; i2++) {
    const a = arrays[i2];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
var Hash = class {
};
function createHasher2(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes3(bytesLength = 32) {
  if (crypto && typeof crypto.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto && typeof crypto.randomBytes === "function") {
    return Uint8Array.from(crypto.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// ../node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE3) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE3);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE3 ? 4 : 0;
  const l = isLE3 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE3);
  view.setUint32(byteOffset + l, wl, isLE3);
}
function Chi2(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj2(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD2 = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE3) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE3;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView3(this.buffer);
  }
  update(data) {
    aexists3(this);
    data = toBytes(data);
    abytes4(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView3(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists3(this);
    aoutput3(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE3 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean3(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i2 = pos; i2 < blockLen; i2++)
      buffer[i2] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE3);
    this.process(view, 0);
    const oview = createView3(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i2 = 0; i2 < outLen; i2++)
      oview.setUint32(4 * i2, state[i2], isLE3);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV2 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// ../node_modules/@noble/hashes/esm/sha2.js
var SHA256_K2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD2 {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV2[0] | 0;
    this.B = SHA256_IV2[1] | 0;
    this.C = SHA256_IV2[2] | 0;
    this.D = SHA256_IV2[3] | 0;
    this.E = SHA256_IV2[4] | 0;
    this.F = SHA256_IV2[5] | 0;
    this.G = SHA256_IV2[6] | 0;
    this.H = SHA256_IV2[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i2 = 0; i2 < 16; i2++, offset += 4)
      SHA256_W2[i2] = view.getUint32(offset, false);
    for (let i2 = 16; i2 < 64; i2++) {
      const W15 = SHA256_W2[i2 - 15];
      const W2 = SHA256_W2[i2 - 2];
      const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
      const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
      SHA256_W2[i2] = s1 + SHA256_W2[i2 - 7] + s0 + SHA256_W2[i2 - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i2 = 0; i2 < 64; i2++) {
      const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
      const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i2] + SHA256_W2[i2] | 0;
      const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
      const T2 = sigma0 + Maj2(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean3(SHA256_W2);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean3(this.buffer);
  }
};
var sha2562 = /* @__PURE__ */ createHasher2(() => new SHA256());

// ../node_modules/@noble/hashes/esm/hmac.js
var HMAC = class extends Hash {
  constructor(hash, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    ahash2(hash);
    const key = toBytes(_key);
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad2 = new Uint8Array(blockLen);
    pad2.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i2 = 0; i2 < pad2.length; i2++)
      pad2[i2] ^= 54;
    this.iHash.update(pad2);
    this.oHash = hash.create();
    for (let i2 = 0; i2 < pad2.length; i2++)
      pad2[i2] ^= 54 ^ 92;
    this.oHash.update(pad2);
    clean3(pad2);
  }
  update(buf) {
    aexists3(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists3(this);
    abytes4(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac2 = (hash, key, message) => new HMAC(hash, key).update(message).digest();
hmac2.create = (hash, key) => new HMAC(hash, key);

// ../node_modules/@noble/curves/esm/utils.js
var _0n6 = /* @__PURE__ */ BigInt(0);
var _1n5 = /* @__PURE__ */ BigInt(1);
function _abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}"`;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function _abytes2(value, length, title = "") {
  const bytes = isBytes4(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function numberToHexUnpadded2(num3) {
  const hex = num3.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber3(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n6 : BigInt("0x" + hex);
}
function bytesToNumberBE2(bytes) {
  return hexToNumber3(bytesToHex3(bytes));
}
function bytesToNumberLE2(bytes) {
  abytes4(bytes);
  return hexToNumber3(bytesToHex3(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE3(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE2(n, len) {
  return numberToBytesBE3(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes4(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
var isPosBig2 = (n) => typeof n === "bigint" && _0n6 <= n;
function inRange2(n, min, max) {
  return isPosBig2(n) && isPosBig2(min) && isPosBig2(max) && min <= n && n < max;
}
function aInRange2(title, n, min, max) {
  if (!inRange2(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen2(n) {
  let len;
  for (len = 0; n > _0n6; n >>= _1n5, len += 1)
    ;
  return len;
}
var bitMask2 = (n) => (_1n5 << BigInt(n)) - _1n5;
function createHmacDrbg2(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const u8of = (byte) => Uint8Array.of(byte);
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i2 = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i2 = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n(0)) => {
    k = h(u8of(0), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8of(1), seed);
    v = h();
  };
  const gen = () => {
    if (i2++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function _validateObject(object, fields, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
  Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
}
function memoized2(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// ../node_modules/@noble/curves/esm/abstract/modular.js
var _0n7 = BigInt(0);
var _1n6 = BigInt(1);
var _2n4 = /* @__PURE__ */ BigInt(2);
var _3n3 = /* @__PURE__ */ BigInt(3);
var _4n3 = /* @__PURE__ */ BigInt(4);
var _5n2 = /* @__PURE__ */ BigInt(5);
var _7n2 = /* @__PURE__ */ BigInt(7);
var _8n2 = /* @__PURE__ */ BigInt(8);
var _9n2 = /* @__PURE__ */ BigInt(9);
var _16n2 = /* @__PURE__ */ BigInt(16);
function mod2(a, b) {
  const result = a % b;
  return result >= _0n7 ? result : b + result;
}
function pow22(x, power, modulo) {
  let res = x;
  while (power-- > _0n7) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert2(number, modulo) {
  if (number === _0n7)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n7)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod2(number, modulo);
  let b = modulo;
  let x = _0n7, y = _1n6, u = _1n6, v = _0n7;
  while (a !== _0n7) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd3 = b;
  if (gcd3 !== _1n6)
    throw new Error("invert: does not exist");
  return mod2(x, modulo);
}
function assertIsSquare2(Fp, root, n) {
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod42(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n6) / _4n3;
  const root = Fp.pow(n, p1div4);
  assertIsSquare2(Fp, root, n);
  return root;
}
function sqrt5mod82(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n2) / _8n2;
  const n2 = Fp.mul(n, _2n4);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i2 = Fp.mul(Fp.mul(nv, _2n4), v);
  const root = Fp.mul(nv, Fp.sub(i2, Fp.ONE));
  assertIsSquare2(Fp, root, n);
  return root;
}
function sqrt9mod162(P) {
  const Fp_ = Field2(P);
  const tn = tonelliShanks2(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n2) / _16n2;
  return (Fp, n) => {
    let tv1 = Fp.pow(n, c4);
    let tv2 = Fp.mul(tv1, c1);
    const tv3 = Fp.mul(tv1, c2);
    const tv4 = Fp.mul(tv1, c3);
    const e1 = Fp.eql(Fp.sqr(tv2), n);
    const e2 = Fp.eql(Fp.sqr(tv3), n);
    tv1 = Fp.cmov(tv1, tv2, e1);
    tv2 = Fp.cmov(tv4, tv3, e2);
    const e3 = Fp.eql(Fp.sqr(tv2), n);
    const root = Fp.cmov(tv1, tv2, e3);
    assertIsSquare2(Fp, root, n);
    return root;
  };
}
function tonelliShanks2(P) {
  if (P < _3n3)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n6;
  let S = 0;
  while (Q % _2n4 === _0n7) {
    Q /= _2n4;
    S++;
  }
  let Z = _2n4;
  const _Fp = Field2(P);
  while (FpLegendre2(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod42;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n6) / _2n4;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre2(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i2 = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i2++;
        t_tmp = Fp.sqr(t_tmp);
        if (i2 === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n6 << BigInt(M - i2 - 1);
      const b = Fp.pow(c, exponent);
      M = i2;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt2(P) {
  if (P % _4n3 === _3n3)
    return sqrt3mod42;
  if (P % _8n2 === _5n2)
    return sqrt5mod82;
  if (P % _16n2 === _9n2)
    return sqrt9mod162(P);
  return tonelliShanks2(P);
}
var FIELD_FIELDS2 = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField2(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS2.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  _validateObject(field, opts);
  return field;
}
function FpPow2(Fp, num3, power) {
  if (power < _0n7)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n7)
    return Fp.ONE;
  if (power === _1n6)
    return num3;
  let p = Fp.ONE;
  let d4 = num3;
  while (power > _0n7) {
    if (power & _1n6)
      p = Fp.mul(p, d4);
    d4 = Fp.sqr(d4);
    power >>= _1n6;
  }
  return p;
}
function FpInvertBatch2(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num3, i2) => {
    if (Fp.is0(num3))
      return acc;
    inverted[i2] = acc;
    return Fp.mul(acc, num3);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num3, i2) => {
    if (Fp.is0(num3))
      return acc;
    inverted[i2] = Fp.mul(acc, inverted[i2]);
    return Fp.mul(acc, num3);
  }, invertedAcc);
  return inverted;
}
function FpLegendre2(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n6) / _2n4;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength2(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber4(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field2(ORDER, bitLenOrOpts, isLE3 = false, opts = {}) {
  if (ORDER <= _0n7)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  let _nbitLength = void 0;
  let _sqrt = void 0;
  let modFromBytes = false;
  let allowedLengths = void 0;
  if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
    if (opts.sqrt || isLE3)
      throw new Error("cannot specify opts in two arguments");
    const _opts = bitLenOrOpts;
    if (_opts.BITS)
      _nbitLength = _opts.BITS;
    if (_opts.sqrt)
      _sqrt = _opts.sqrt;
    if (typeof _opts.isLE === "boolean")
      isLE3 = _opts.isLE;
    if (typeof _opts.modFromBytes === "boolean")
      modFromBytes = _opts.modFromBytes;
    allowedLengths = _opts.allowedLengths;
  } else {
    if (typeof bitLenOrOpts === "number")
      _nbitLength = bitLenOrOpts;
    if (opts.sqrt)
      _sqrt = opts.sqrt;
  }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength2(ORDER, _nbitLength);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE3,
    BITS,
    BYTES,
    MASK: bitMask2(BITS),
    ZERO: _0n7,
    ONE: _1n6,
    allowedLengths,
    create: (num3) => mod2(num3, ORDER),
    isValid: (num3) => {
      if (typeof num3 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num3);
      return _0n7 <= num3 && num3 < ORDER;
    },
    is0: (num3) => num3 === _0n7,
    // is valid and invertible
    isValidNot0: (num3) => !f.is0(num3) && f.isValid(num3),
    isOdd: (num3) => (num3 & _1n6) === _1n6,
    neg: (num3) => mod2(-num3, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num3) => mod2(num3 * num3, ORDER),
    add: (lhs, rhs) => mod2(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod2(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod2(lhs * rhs, ORDER),
    pow: (num3, power) => FpPow2(f, num3, power),
    div: (lhs, rhs) => mod2(lhs * invert2(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num3) => num3 * num3,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num3) => invert2(num3, ORDER),
    sqrt: _sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt2(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num3) => isLE3 ? numberToBytesLE2(num3, BYTES) : numberToBytesBE3(num3, BYTES),
    fromBytes: (bytes, skipValidation = true) => {
      if (allowedLengths) {
        if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes, isLE3 ? 0 : padded.length - bytes.length);
        bytes = padded;
      }
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      let scalar = isLE3 ? bytesToNumberLE2(bytes) : bytesToNumberBE2(bytes);
      if (modFromBytes)
        scalar = mod2(scalar, ORDER);
      if (!skipValidation) {
        if (!f.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch2(f, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength2(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength2(fieldOrder) {
  const length = getFieldBytesLength2(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField2(key, fieldOrder, isLE3 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength2(fieldOrder);
  const minLen = getMinHashLength2(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num3 = isLE3 ? bytesToNumberLE2(key) : bytesToNumberBE2(key);
  const reduced = mod2(num3, fieldOrder - _1n6) + _1n6;
  return isLE3 ? numberToBytesLE2(reduced, fieldLen) : numberToBytesBE3(reduced, fieldLen);
}

// ../node_modules/@noble/curves/esm/abstract/curve.js
var _0n8 = BigInt(0);
var _1n7 = BigInt(1);
function negateCt2(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ2(c, points) {
  const invertedZs = FpInvertBatch2(c.Fp, points.map((p) => p.Z));
  return points.map((p, i2) => c.fromAffine(p.toAffine(invertedZs[i2])));
}
function validateW2(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts2(W, scalarBits) {
  validateW2(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask2(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets2(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n7;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i2) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i2);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i2) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i2);
  });
}
var pointPrecomputes2 = /* @__PURE__ */ new WeakMap();
var pointWindowSizes2 = /* @__PURE__ */ new WeakMap();
function getW2(P) {
  return pointWindowSizes2.get(P) || 1;
}
function assert02(n) {
  if (n !== _0n8)
    throw new Error("invalid wNAF");
}
var wNAF2 = class {
  // Parametrized with a given Point class (not individual point)
  constructor(Point, bits) {
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.Fn = Point.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d4 = elm;
    while (n > _0n8) {
      if (n & _1n7)
        p = p.add(d4);
      d4 = d4.double();
      n >>= _1n7;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts2(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i2 = 1; i2 < windowSize; i2++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts2(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets2(n, window2, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt2(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt2(isNeg, precomputes[offset]));
      }
    }
    assert02(n);
    return { p, f };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts2(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      if (n === _0n8)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets2(n, window2, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert02(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes2.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes2.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW2(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW2(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW2(W, this.bits);
    pointWindowSizes2.set(P, W);
    pointPrecomputes2.delete(P);
  }
  hasCache(elm) {
    return getW2(elm) !== 1;
  }
};
function mulEndoUnsafe2(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n8 || k2 > _0n8) {
    if (k1 & _1n7)
      p1 = p1.add(acc);
    if (k2 & _1n7)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n7;
    k2 >>= _1n7;
  }
  return { p1, p2 };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen2(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask2(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i2 = lastBits; i2 >= 0; i2 -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i2) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i2 !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function createField2(order, field, isLE3) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField2(field);
    return field;
  } else {
    return Field2(order, { isLE: isLE3 });
  }
}
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n8))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField2(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField2(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}

// ../node_modules/@noble/curves/esm/abstract/weierstrass.js
var divNearest2 = (num3, den) => (num3 + (num3 >= 0 ? den : -den) / _2n5) / den;
function _splitEndoScalar2(k, basis, n) {
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest2(b2 * k, n);
  const c2 = divNearest2(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n9;
  const k2neg = k2 < _0n9;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask2(Math.ceil(bitLen2(n) / 2)) + _1n8;
  if (k1 < _0n9 || k1 >= MAX_NUM || k2 < _0n9 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k);
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat2(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts2(opts, def) {
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  _abool2(optsn.lowS, "lowS");
  _abool2(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat2(optsn.format);
  return optsn;
}
var DERErr2 = class extends Error {
  constructor(m = "") {
    super(m);
  }
};
var DER2 = {
  // asn.1 DER encoding utils
  Err: DERErr2,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER2;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded2(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded2(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded2(tag);
      return t + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = DER2;
      let pos = 0;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num3) {
      const { Err: E } = DER2;
      if (num3 < _0n9)
        throw new E("integer: negative integers are not allowed");
      let hex = numberToHexUnpadded2(num3);
      if (Number.parseInt(hex[0], 16) & 8)
        hex = "00" + hex;
      if (hex.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex;
    },
    decode(data) {
      const { Err: E } = DER2;
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE2(data);
    }
  },
  toSig(hex) {
    const { Err: E, _int: int, _tlv: tlv } = DER2;
    const data = ensureBytes("signature", hex);
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER2;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
var _0n9 = BigInt(0);
var _1n8 = BigInt(1);
var _2n5 = BigInt(2);
var _3n4 = BigInt(3);
var _4n4 = BigInt(4);
function _normFnElement(Fn, key) {
  const { BYTES: expected } = Fn;
  let num3;
  if (typeof key === "bigint") {
    num3 = key;
  } else {
    let bytes = ensureBytes("private key", key);
    try {
      num3 = Fn.fromBytes(bytes);
    } catch (error) {
      throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
    }
  }
  if (!Fn.isValidNot0(num3))
    throw new Error("invalid private key: out of range [1..N-1]");
  return num3;
}
function weierstrassN(params, extraOpts = {}) {
  const validated = _createCurveFields("weierstrass", params, extraOpts);
  const { Fp, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  _validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    wrapPrivateKey: "boolean"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths2(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes3(_c, point, isCompressed) {
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    _abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes3(pprefix2(hasEvenY), bx);
    } else {
      return concatBytes3(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    _abytes2(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const isYOdd = Fp.isOdd(y);
      const isHeadOdd = (head & 1) === 1;
      if (isHeadOdd !== isYOdd)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes3;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n4), _4n4);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar2(k, endo.basises, Fn.ORDER);
  }
  const toAffineMemo = memoized2((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp.eql(Z, Fp.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(Z);
    const x = Fp.mul(X, iz);
    const y = Fp.mul(Y, iz);
    const zz = Fp.mul(Z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x, y };
  });
  const assertValidMemo = memoized2((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt2(k1neg, k1p);
    k2p = negateCt2(k2neg, k2p);
    return k1p.add(k2p);
  }
  class Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = Point.fromAffine(decodePoint(_abytes2(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return Point.fromBytes(ensureBytes("pointHex", hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n4);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n4);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n4);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ2(Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ2(Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n9 || p.is0())
        return Point.ZERO;
      if (sc === _1n8)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe2(Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
      return sum.is0() ? void 0 : sum;
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n8)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n8)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      _abool2(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex3(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(isCompressed = true) {
      return this.toBytes(isCompressed);
    }
    _setWindowSize(windowSize) {
      this.precompute(windowSize);
    }
    static normalizeZ(points) {
      return normalizeZ2(Point, points);
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(_normFnElement(Fn, privateKey));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
  Point.Fp = Fp;
  Point.Fn = Fn;
  const bits = Fn.BITS;
  const wnaf = new wNAF2(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  Point.BASE.precompute(8);
  return Point;
}
function pprefix2(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths2(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn.BYTES
  };
}
function ecdh2(Point, ecdhOpts = {}) {
  const { Fn } = Point;
  const randomBytes_ = ecdhOpts.randomBytes || randomBytes3;
  const lengths = Object.assign(getWLengths2(Point.Fp, Fn), { seed: getMinHashLength2(Fn.ORDER) });
  function isValidSecretKey(secretKey) {
    try {
      return !!_normFnElement(Fn, secretKey);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed = randomBytes_(lengths.seed)) {
    return mapHashToField2(_abytes2(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey2(secretKey, isCompressed = true) {
    return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
  }
  function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey2(secretKey) };
  }
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point)
      return true;
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    if (Fn.allowedLengths || secretKey === publicKey)
      return void 0;
    const l = ensureBytes("key", item).length;
    return l === publicKey || l === publicKeyUncompressed;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = _normFnElement(Fn, secretKeyA);
    const b = Point.fromHex(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey,
    // TODO: remove
    isValidPrivateKey: isValidSecretKey,
    randomPrivateKey: randomSecretKey,
    normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
    precompute(windowSize = 8, point = Point.BASE) {
      return point.precompute(windowSize, false);
    }
  };
  return Object.freeze({ getPublicKey: getPublicKey2, getSharedSecret, keygen, Point, utils, lengths });
}
function ecdsa2(Point, hash, ecdsaOpts = {}) {
  ahash2(hash);
  _validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const randomBytes4 = ecdsaOpts.randomBytes || randomBytes3;
  const hmac3 = ecdsaOpts.hmac || ((key, ...msgs) => hmac2(hash, key, concatBytes3(...msgs)));
  const { Fp, Fn } = Point;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey: getPublicKey2, getSharedSecret, utils, lengths } = ecdh2(Point, ecdsaOpts);
  const defaultSigOpts = {
    prehash: false,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
    format: void 0,
    //'compact' as ECDSASigFormat,
    extraEntropy: false
  };
  const defaultSigOpts_format = "compact";
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n8;
    return number > HALF;
  }
  function validateRS(title, num3) {
    if (!Fn.isValidNot0(num3))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num3;
  }
  function validateSigLength(bytes, format) {
    validateSigFormat2(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return _abytes2(bytes, sizer, `${format} signature`);
  }
  class Signature {
    constructor(r, s, recovery) {
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts_format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER2.toSig(_abytes2(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = Fn.BYTES;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes2(hex), format);
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(messageHash) {
      const FIELD_ORDER = Fp.ORDER;
      const { r, s, recovery: rec } = this;
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const hasCofactor = CURVE_ORDER * _2n5 < FIELD_ORDER;
      if (hasCofactor && rec > 1)
        throw new Error("recovery id is ambiguous for h>1 curve");
      const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("recovery id 2 or 3 invalid");
      const x = Fp.toBytes(radj);
      const R = Point.fromBytes(concatBytes3(pprefix2((rec & 1) === 0), x));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(ensureBytes("msgHash", messageHash));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts_format) {
      validateSigFormat2(format);
      if (format === "der")
        return hexToBytes2(DER2.hexFromSig(this));
      const r = Fn.toBytes(this.r);
      const s = Fn.toBytes(this.s);
      if (format === "recovered") {
        if (this.recovery == null)
          throw new Error("recovery bit must be present");
        return concatBytes3(Uint8Array.of(this.recovery), r, s);
      }
      return concatBytes3(r, s);
    }
    toHex(format) {
      return bytesToHex3(this.toBytes(format));
    }
    // TODO: remove
    assertValidity() {
    }
    static fromCompact(hex) {
      return Signature.fromBytes(ensureBytes("sig", hex), "compact");
    }
    static fromDER(hex) {
      return Signature.fromBytes(ensureBytes("sig", hex), "der");
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return this.toBytes("der");
    }
    toDERHex() {
      return bytesToHex3(this.toBytes("der"));
    }
    toCompactRawBytes() {
      return this.toBytes("compact");
    }
    toCompactHex() {
      return bytesToHex3(this.toBytes("compact"));
    }
  }
  const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num3 = bytesToNumberBE2(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num3 >> BigInt(delta) : num3;
  };
  const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
    return Fn.create(bits2int(bytes));
  };
  const ORDER_MASK = bitMask2(fnBits);
  function int2octets(num3) {
    aInRange2("num < 2^" + fnBits, num3, _0n9, ORDER_MASK);
    return Fn.toBytes(num3);
  }
  function validateMsgAndHash(message, prehash) {
    _abytes2(message, void 0, "message");
    return prehash ? _abytes2(hash(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, privateKey, opts) {
    if (["recovered", "canonical"].some((k) => k in opts))
      throw new Error("sign() legacy options not supported");
    const { lowS, prehash, extraEntropy } = validateSigOpts2(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d4 = _normFnElement(Fn, privateKey);
    const seedArgs = [int2octets(d4), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes4(lengths.secretKey) : extraEntropy;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n9)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d4));
      if (s === _0n9)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n8);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    message = ensureBytes("message", message);
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg2(hash.outputLen, Fn.BYTES, hmac3);
    const sig = drbg(seed, k2sig);
    return sig;
  }
  function tryParsingSig(sg) {
    let sig = void 0;
    const isHex = typeof sg === "string" || isBytes4(sg);
    const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    if (isObj) {
      sig = new Signature(sg.r, sg.s);
    } else if (isHex) {
      try {
        sig = Signature.fromBytes(ensureBytes("sig", sg), "der");
      } catch (derError) {
        if (!(derError instanceof DER2.Err))
          throw derError;
      }
      if (!sig) {
        try {
          sig = Signature.fromBytes(ensureBytes("sig", sg), "compact");
        } catch (error) {
          return false;
        }
      }
    }
    if (!sig)
      return false;
    return sig;
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts2(opts, defaultSigOpts);
    publicKey = ensureBytes("publicKey", publicKey);
    message = validateMsgAndHash(ensureBytes("message", message), prehash);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    const sig = format === void 0 ? tryParsingSig(signature) : Signature.fromBytes(ensureBytes("sig", signature), format);
    if (sig === false)
      return false;
    try {
      const P = Point.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts2(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey: getPublicKey2,
    getSharedSecret,
    utils,
    lengths,
    Point,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash
  });
}
function _weierstrass_legacy_opts_to_new(c) {
  const CURVE = {
    a: c.a,
    b: c.b,
    p: c.Fp.ORDER,
    n: c.n,
    h: c.h,
    Gx: c.Gx,
    Gy: c.Gy
  };
  const Fp = c.Fp;
  let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
  const Fn = Field2(CURVE.n, {
    BITS: c.nBitLength,
    allowedLengths,
    modFromBytes: c.wrapPrivateKey
  });
  const curveOpts = {
    Fp,
    Fn,
    allowInfinityPoint: c.allowInfinityPoint,
    endo: c.endo,
    isTorsionFree: c.isTorsionFree,
    clearCofactor: c.clearCofactor,
    fromBytes: c.fromBytes,
    toBytes: c.toBytes
  };
  return { CURVE, curveOpts };
}
function _ecdsa_legacy_opts_to_new(c) {
  const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
  const ecdsaOpts = {
    hmac: c.hmac,
    randomBytes: c.randomBytes,
    lowS: c.lowS,
    bits2int: c.bits2int,
    bits2int_modN: c.bits2int_modN
  };
  return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
}
function _ecdsa_new_output_to_legacy(c, _ecdsa) {
  const Point = _ecdsa.Point;
  return Object.assign({}, _ecdsa, {
    ProjectivePoint: Point,
    CURVE: Object.assign({}, c, nLength2(Point.Fn.ORDER, Point.Fn.BITS))
  });
}
function weierstrass2(c) {
  const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
  const Point = weierstrassN(CURVE, curveOpts);
  const signs = ecdsa2(Point, hash, ecdsaOpts);
  return _ecdsa_new_output_to_legacy(c, signs);
}

// ../node_modules/@noble/curves/esm/_shortw_utils.js
function createCurve(curveDef, defHash) {
  const create = (hash) => weierstrass2({ ...curveDef, hash });
  return { ...create(defHash), create };
}

// ../node_modules/@noble/curves/esm/secp256k1.js
var secp256k1_CURVE2 = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO2 = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _0n10 = /* @__PURE__ */ BigInt(0);
var _1n9 = /* @__PURE__ */ BigInt(1);
var _2n6 = /* @__PURE__ */ BigInt(2);
function sqrtMod2(y) {
  const P = secp256k1_CURVE2.p;
  const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow22(b3, _3n5, P) * b3 % P;
  const b9 = pow22(b6, _3n5, P) * b3 % P;
  const b11 = pow22(b9, _2n6, P) * b2 % P;
  const b22 = pow22(b11, _11n, P) * b11 % P;
  const b44 = pow22(b22, _22n, P) * b22 % P;
  const b88 = pow22(b44, _44n, P) * b44 % P;
  const b176 = pow22(b88, _88n, P) * b88 % P;
  const b220 = pow22(b176, _44n, P) * b44 % P;
  const b223 = pow22(b220, _3n5, P) * b3 % P;
  const t1 = pow22(b223, _23n, P) * b22 % P;
  const t2 = pow22(t1, _6n, P) * b2 % P;
  const root = pow22(t2, _2n6, P);
  if (!Fpk12.eql(Fpk12.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk12 = Field2(secp256k1_CURVE2.p, { sqrt: sqrtMod2 });
var secp256k12 = createCurve({ ...secp256k1_CURVE2, Fp: Fpk12, lowS: true, endo: secp256k1_ENDO2 }, sha2562);
var TAGGED_HASH_PREFIXES2 = {};
function taggedHash2(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES2[tag];
  if (tagP === void 0) {
    const tagH = sha2562(utf8ToBytes2(tag));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES2[tag] = tagP;
  }
  return sha2562(concatBytes3(tagP, ...messages));
}
var pointToBytes2 = (point) => point.toBytes(true).slice(1);
var Pointk12 = /* @__PURE__ */ (() => secp256k12.Point)();
var hasEven2 = (y) => y % _2n6 === _0n10;
function schnorrGetExtPubKey2(priv) {
  const { Fn, BASE } = Pointk12;
  const d_ = _normFnElement(Fn, priv);
  const p = BASE.multiply(d_);
  const scalar = hasEven2(p.y) ? d_ : Fn.neg(d_);
  return { scalar, bytes: pointToBytes2(p) };
}
function lift_x2(x) {
  const Fp = Fpk12;
  if (!Fp.isValidNot0(x))
    throw new Error("invalid x: Fail if x \u2265 p");
  const xx = Fp.create(x * x);
  const c = Fp.create(xx * x + BigInt(7));
  let y = Fp.sqrt(c);
  if (!hasEven2(y))
    y = Fp.neg(y);
  const p = Pointk12.fromAffine({ x, y });
  p.assertValidity();
  return p;
}
var num2 = bytesToNumberBE2;
function challenge2(...args) {
  return Pointk12.Fn.create(num2(taggedHash2("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey2(secretKey) {
  return schnorrGetExtPubKey2(secretKey).bytes;
}
function schnorrSign2(message, secretKey, auxRand = randomBytes3(32)) {
  const { Fn } = Pointk12;
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d4 } = schnorrGetExtPubKey2(secretKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = Fn.toBytes(d4 ^ num2(taggedHash2("BIP0340/aux", a)));
  const rand = taggedHash2("BIP0340/nonce", t, px, m);
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey2(rand);
  const e = challenge2(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn.toBytes(Fn.create(k + e * d4)), 32);
  if (!schnorrVerify2(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify2(signature, message, publicKey) {
  const { Fn, BASE } = Pointk12;
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x2(num2(pub));
    const r = num2(sig.subarray(0, 32));
    if (!inRange2(r, _1n9, secp256k1_CURVE2.p))
      return false;
    const s = num2(sig.subarray(32, 64));
    if (!inRange2(s, _1n9, secp256k1_CURVE2.n))
      return false;
    const e = challenge2(Fn.toBytes(r), pointToBytes2(P), m);
    const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
    const { x, y } = R.toAffine();
    if (R.is0() || !hasEven2(y) || x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr2 = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed = randomBytes3(seedLength)) => {
    return mapHashToField2(seed, secp256k1_CURVE2.n);
  };
  secp256k12.utils.randomSecretKey;
  function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: schnorrGetPublicKey2(secretKey) };
  }
  return {
    keygen,
    getPublicKey: schnorrGetPublicKey2,
    sign: schnorrSign2,
    verify: schnorrVerify2,
    Point: Pointk12,
    utils: {
      randomSecretKey,
      randomPrivateKey: randomSecretKey,
      taggedHash: taggedHash2,
      // TODO: remove
      lift_x: lift_x2,
      pointToBytes: pointToBytes2,
      numberToBytesBE: numberToBytesBE3,
      bytesToNumberBE: bytesToNumberBE2,
      mod: mod2
    },
    lengths: {
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    }
  };
})();

// ../node_modules/@noble/hashes/esm/sha256.js
var sha2563 = sha2562;

// ../node_modules/@nostr-dev-kit/ndk/dist/index.mjs
var import_typescript_lru_cache = __toESM(require_dist(), 1);
var import_tseep3 = __toESM(require_lib(), 1);

// ../node_modules/nostr-tools/lib/esm/nip49.js
var nip49_exports = {};
__export(nip49_exports, {
  decrypt: () => decrypt3,
  encrypt: () => encrypt3
});

// ../node_modules/nostr-tools/node_modules/@noble/hashes/pbkdf2.js
function pbkdf2Init(hash, _password, _salt, _opts) {
  ahash(hash);
  const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
  const { c, dkLen, asyncTick } = opts;
  anumber(c, "c");
  anumber(dkLen, "dkLen");
  anumber(asyncTick, "asyncTick");
  if (c < 1)
    throw new Error("iterations (c) must be >= 1");
  const password = kdfInputToBytes(_password, "password");
  const salt = kdfInputToBytes(_salt, "salt");
  const DK = new Uint8Array(dkLen);
  const PRF = hmac.create(hash, password);
  const PRFSalt = PRF._cloneInto().update(salt);
  return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
}
function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
  PRF.destroy();
  PRFSalt.destroy();
  if (prfW)
    prfW.destroy();
  clean(u);
  return DK;
}
function pbkdf2(hash, password, salt, opts) {
  const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
  let prfW;
  const arr = new Uint8Array(4);
  const view = createView(arr);
  const u = new Uint8Array(PRF.outputLen);
  for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
    const Ti = DK.subarray(pos, pos + PRF.outputLen);
    view.setInt32(0, ti, false);
    (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
    Ti.set(u.subarray(0, Ti.length));
    for (let ui = 1; ui < c; ui++) {
      PRF._cloneInto(prfW).update(u).digestInto(u);
      for (let i2 = 0; i2 < Ti.length; i2++)
        Ti[i2] ^= u[i2];
    }
  }
  return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
}

// ../node_modules/nostr-tools/node_modules/@noble/hashes/scrypt.js
function XorAndSalsa(prev, pi, input, ii, out, oi) {
  let y00 = prev[pi++] ^ input[ii++], y01 = prev[pi++] ^ input[ii++];
  let y02 = prev[pi++] ^ input[ii++], y03 = prev[pi++] ^ input[ii++];
  let y04 = prev[pi++] ^ input[ii++], y05 = prev[pi++] ^ input[ii++];
  let y06 = prev[pi++] ^ input[ii++], y07 = prev[pi++] ^ input[ii++];
  let y08 = prev[pi++] ^ input[ii++], y09 = prev[pi++] ^ input[ii++];
  let y10 = prev[pi++] ^ input[ii++], y11 = prev[pi++] ^ input[ii++];
  let y12 = prev[pi++] ^ input[ii++], y13 = prev[pi++] ^ input[ii++];
  let y14 = prev[pi++] ^ input[ii++], y15 = prev[pi++] ^ input[ii++];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let i2 = 0; i2 < 8; i2 += 2) {
    x04 ^= rotl(x00 + x12 | 0, 7);
    x08 ^= rotl(x04 + x00 | 0, 9);
    x12 ^= rotl(x08 + x04 | 0, 13);
    x00 ^= rotl(x12 + x08 | 0, 18);
    x09 ^= rotl(x05 + x01 | 0, 7);
    x13 ^= rotl(x09 + x05 | 0, 9);
    x01 ^= rotl(x13 + x09 | 0, 13);
    x05 ^= rotl(x01 + x13 | 0, 18);
    x14 ^= rotl(x10 + x06 | 0, 7);
    x02 ^= rotl(x14 + x10 | 0, 9);
    x06 ^= rotl(x02 + x14 | 0, 13);
    x10 ^= rotl(x06 + x02 | 0, 18);
    x03 ^= rotl(x15 + x11 | 0, 7);
    x07 ^= rotl(x03 + x15 | 0, 9);
    x11 ^= rotl(x07 + x03 | 0, 13);
    x15 ^= rotl(x11 + x07 | 0, 18);
    x01 ^= rotl(x00 + x03 | 0, 7);
    x02 ^= rotl(x01 + x00 | 0, 9);
    x03 ^= rotl(x02 + x01 | 0, 13);
    x00 ^= rotl(x03 + x02 | 0, 18);
    x06 ^= rotl(x05 + x04 | 0, 7);
    x07 ^= rotl(x06 + x05 | 0, 9);
    x04 ^= rotl(x07 + x06 | 0, 13);
    x05 ^= rotl(x04 + x07 | 0, 18);
    x11 ^= rotl(x10 + x09 | 0, 7);
    x08 ^= rotl(x11 + x10 | 0, 9);
    x09 ^= rotl(x08 + x11 | 0, 13);
    x10 ^= rotl(x09 + x08 | 0, 18);
    x12 ^= rotl(x15 + x14 | 0, 7);
    x13 ^= rotl(x12 + x15 | 0, 9);
    x14 ^= rotl(x13 + x12 | 0, 13);
    x15 ^= rotl(x14 + x13 | 0, 18);
  }
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function BlockMix(input, ii, out, oi, r) {
  let head = oi + 0;
  let tail = oi + 16 * r;
  for (let i2 = 0; i2 < 16; i2++)
    out[tail + i2] = input[ii + (2 * r - 1) * 16 + i2];
  for (let i2 = 0; i2 < r; i2++, head += 16, ii += 16) {
    XorAndSalsa(out, tail, input, ii, out, head);
    if (i2 > 0)
      tail += 16;
    XorAndSalsa(out, head, input, ii += 16, out, tail);
  }
}
function scryptInit(password, salt, _opts) {
  const opts = checkOpts({
    dkLen: 32,
    asyncTick: 10,
    maxmem: 1024 ** 3 + 1024
  }, _opts);
  const { N, r, p, dkLen, asyncTick, maxmem, onProgress } = opts;
  anumber(N, "N");
  anumber(r, "r");
  anumber(p, "p");
  anumber(dkLen, "dkLen");
  anumber(asyncTick, "asyncTick");
  anumber(maxmem, "maxmem");
  if (onProgress !== void 0 && typeof onProgress !== "function")
    throw new Error("progressCb must be a function");
  const blockSize = 128 * r;
  const blockSize32 = blockSize / 4;
  const pow32 = Math.pow(2, 32);
  if (N <= 1 || (N & N - 1) !== 0 || N > pow32)
    throw new Error('"N" expected a power of 2, and 2^1 <= N <= 2^32');
  if (p < 1 || p > (pow32 - 1) * 32 / blockSize)
    throw new Error('"p" expected integer 1..((2^32 - 1) * 32) / (128 * r)');
  if (dkLen < 1 || dkLen > (pow32 - 1) * 32)
    throw new Error('"dkLen" expected integer 1..(2^32 - 1) * 32');
  const memUsed = blockSize * (N + p);
  if (memUsed > maxmem)
    throw new Error('"maxmem" limit was hit, expected 128*r*(N+p) <= "maxmem"=' + maxmem);
  const B = pbkdf2(sha256, password, salt, { c: 1, dkLen: blockSize * p });
  const B32 = u32(B);
  const V = u32(new Uint8Array(blockSize * N));
  const tmp = u32(new Uint8Array(blockSize));
  let blockMixCb = () => {
  };
  if (onProgress) {
    const totalBlockMix = 2 * N * p;
    const callbackPer = Math.max(Math.floor(totalBlockMix / 1e4), 1);
    let blockMixCnt = 0;
    blockMixCb = () => {
      blockMixCnt++;
      if (onProgress && (!(blockMixCnt % callbackPer) || blockMixCnt === totalBlockMix))
        onProgress(blockMixCnt / totalBlockMix);
    };
  }
  return { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb, asyncTick };
}
function scryptOutput(password, dkLen, B, V, tmp) {
  const res = pbkdf2(sha256, password, B, { c: 1, dkLen });
  clean(B, V, tmp);
  return res;
}
function scrypt(password, salt, opts) {
  const { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb } = scryptInit(password, salt, opts);
  swap32IfBE(B32);
  for (let pi = 0; pi < p; pi++) {
    const Pi = blockSize32 * pi;
    for (let i2 = 0; i2 < blockSize32; i2++)
      V[i2] = B32[Pi + i2];
    for (let i2 = 0, pos = 0; i2 < N - 1; i2++) {
      BlockMix(V, pos, V, pos += blockSize32, r);
      blockMixCb();
    }
    BlockMix(V, (N - 1) * blockSize32, B32, Pi, r);
    blockMixCb();
    for (let i2 = 0; i2 < N; i2++) {
      const j = (B32[Pi + blockSize32 - 16] & N - 1) >>> 0;
      for (let k = 0; k < blockSize32; k++)
        tmp[k] = B32[Pi + k] ^ V[j * blockSize32 + k];
      BlockMix(tmp, 0, B32, Pi, r);
      blockMixCb();
    }
  }
  swap32IfBE(B32);
  return scryptOutput(password, dkLen, B, V, tmp);
}

// ../node_modules/nostr-tools/lib/esm/nip49.js
var Bech32MaxSize2 = 5e3;
function encodeBech322(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize2);
}
function encodeBytes2(prefix, bytes) {
  return encodeBech322(prefix, bytes);
}
function encrypt3(sec, password, logn = 16, ksb = 2) {
  let salt = randomBytes(16);
  let n = 2 ** logn;
  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let nonce = randomBytes(24);
  let aad = Uint8Array.from([ksb]);
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let ciphertext = xc2p1.encrypt(sec);
  let b = concatBytes(Uint8Array.from([2]), Uint8Array.from([logn]), salt, nonce, aad, ciphertext);
  return encodeBytes2("ncryptsec", b);
}
function decrypt3(ncryptsec, password) {
  let { prefix, words } = bech32.decode(ncryptsec, Bech32MaxSize2);
  if (prefix !== "ncryptsec") {
    throw new Error(`invalid prefix ${prefix}, expected 'ncryptsec'`);
  }
  let b = new Uint8Array(bech32.fromWords(words));
  let version = b[0];
  if (version !== 2) {
    throw new Error(`invalid version ${version}, expected 0x02`);
  }
  let logn = b[1];
  let n = 2 ** logn;
  let salt = b.slice(2, 2 + 16);
  let nonce = b.slice(2 + 16, 2 + 16 + 24);
  let ksb = b[2 + 16 + 24];
  let aad = Uint8Array.from([ksb]);
  let ciphertext = b.slice(2 + 16 + 24 + 1);
  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let sec = xc2p1.decrypt(ciphertext);
  return sec;
}

// ../node_modules/@nostr-dev-kit/ndk/dist/index.mjs
var import_tseep4 = __toESM(require_lib(), 1);
var import_debug4 = __toESM(require_browser(), 1);
var import_debug5 = __toESM(require_browser(), 1);
var import_debug6 = __toESM(require_browser(), 1);
var import_light_bolt11_decoder = __toESM(require_bolt11(), 1);
var import_debug7 = __toESM(require_browser(), 1);
var import_tseep5 = __toESM(require_lib(), 1);
var import_tseep6 = __toESM(require_lib(), 1);
var import_typescript_lru_cache2 = __toESM(require_dist(), 1);
var import_typescript_lru_cache3 = __toESM(require_dist(), 1);
var import_debug8 = __toESM(require_browser(), 1);

// ../node_modules/nostr-tools/lib/esm/nip19.js
var nip19_exports2 = {};
__export(nip19_exports2, {
  BECH32_REGEX: () => BECH32_REGEX2,
  Bech32MaxSize: () => Bech32MaxSize3,
  NostrTypeGuard: () => NostrTypeGuard2,
  decode: () => decode2,
  decodeNostrURI: () => decodeNostrURI2,
  encodeBytes: () => encodeBytes3,
  naddrEncode: () => naddrEncode2,
  neventEncode: () => neventEncode2,
  noteEncode: () => noteEncode2,
  nprofileEncode: () => nprofileEncode2,
  npubEncode: () => npubEncode2,
  nsecEncode: () => nsecEncode2
});
var utf8Decoder2 = new TextDecoder("utf-8");
var utf8Encoder2 = new TextEncoder();
var NostrTypeGuard2 = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
};
var Bech32MaxSize3 = 5e3;
var BECH32_REGEX2 = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function integerToUint8Array2(number) {
  const uint8Array = new Uint8Array(4);
  uint8Array[0] = number >> 24 & 255;
  uint8Array[1] = number >> 16 & 255;
  uint8Array[2] = number >> 8 & 255;
  uint8Array[3] = number & 255;
  return uint8Array;
}
function decodeNostrURI2(nip19code) {
  try {
    if (nip19code.startsWith("nostr:"))
      nip19code = nip19code.substring(6);
    return decode2(nip19code);
  } catch (_err) {
    return { type: "invalid", data: null };
  }
}
function decode2(code) {
  let { prefix, words } = bech32.decode(code, Bech32MaxSize3);
  let data = new Uint8Array(bech32.fromWords(words));
  switch (prefix) {
    case "nprofile": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder2.decode(d4)) : []
        }
      };
    }
    case "nevent": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (tlv[2] && tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (tlv[3] && tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder2.decode(d4)) : [],
          author: tlv[2]?.[0] ? bytesToHex(tlv[2][0]) : void 0,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex(tlv[3][0]), 16) : void 0
        }
      };
    }
    case "naddr": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!tlv[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!tlv[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: utf8Decoder2.decode(tlv[0][0]),
          pubkey: bytesToHex(tlv[2][0]),
          kind: parseInt(bytesToHex(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d4) => utf8Decoder2.decode(d4)) : []
        }
      };
    }
    case "nsec":
      return { type: prefix, data };
    case "npub":
    case "note":
      return { type: prefix, data: bytesToHex(data) };
    default:
      throw new Error(`unknown prefix ${prefix}`);
  }
}
function parseTLV2(data) {
  let result = {};
  let rest = data;
  while (rest.length > 0) {
    let t = rest[0];
    let l = rest[1];
    let v = rest.slice(2, 2 + l);
    rest = rest.slice(2 + l);
    if (v.length < l)
      throw new Error(`not enough data to read on TLV ${t}`);
    result[t] = result[t] || [];
    result[t].push(v);
  }
  return result;
}
function nsecEncode2(key) {
  return encodeBytes3("nsec", key);
}
function npubEncode2(hex) {
  return encodeBytes3("npub", hexToBytes(hex));
}
function noteEncode2(hex) {
  return encodeBytes3("note", hexToBytes(hex));
}
function encodeBech323(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize3);
}
function encodeBytes3(prefix, bytes) {
  return encodeBech323(prefix, bytes);
}
function nprofileEncode2(profile) {
  let data = encodeTLV2({
    0: [hexToBytes(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder2.encode(url))
  });
  return encodeBech323("nprofile", data);
}
function neventEncode2(event) {
  let kindArray;
  if (event.kind !== void 0) {
    kindArray = integerToUint8Array2(event.kind);
  }
  let data = encodeTLV2({
    0: [hexToBytes(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder2.encode(url)),
    2: event.author ? [hexToBytes(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  });
  return encodeBech323("nevent", data);
}
function naddrEncode2(addr) {
  let kind = new ArrayBuffer(4);
  new DataView(kind).setUint32(0, addr.kind, false);
  let data = encodeTLV2({
    0: [utf8Encoder2.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder2.encode(url)),
    2: [hexToBytes(addr.pubkey)],
    3: [new Uint8Array(kind)]
  });
  return encodeBech323("naddr", data);
}
function encodeTLV2(tlv) {
  let entries = [];
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      let entry = new Uint8Array(v.length + 2);
      entry.set([parseInt(t)], 0);
      entry.set([v.length], 1);
      entry.set(v, 2);
      entries.push(entry);
    });
  });
  return concatBytes(...entries);
}

// ../node_modules/@nostr-dev-kit/ndk/dist/index.mjs
var import_debug9 = __toESM(require_browser(), 1);
var import_debug10 = __toESM(require_browser(), 1);
var import_tseep7 = __toESM(require_lib(), 1);
var import_tseep8 = __toESM(require_lib(), 1);
var import_debug11 = __toESM(require_browser(), 1);
var import_tseep9 = __toESM(require_lib(), 1);

// ../node_modules/@scure/base/lib/esm/index.js
function isBytes5(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function isArrayOf2(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn2(input) {
  if (typeof input !== "function")
    throw new Error("function expected");
  return true;
}
function astr2(label, input) {
  if (typeof input !== "string")
    throw new Error(`${label}: string expected`);
  return true;
}
function anumber5(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`invalid integer: ${n}`);
}
function aArr2(input) {
  if (!Array.isArray(input))
    throw new Error("array expected");
}
function astrArr2(label, input) {
  if (!isArrayOf2(true, input))
    throw new Error(`${label}: array of strings expected`);
}
function anumArr2(label, input) {
  if (!isArrayOf2(false, input))
    throw new Error(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain2(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode2 = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode4 = args.map((x) => x.decode).reduce(wrap, id);
  return { encode: encode2, decode: decode4 };
}
// @__NO_SIDE_EFFECTS__
function alphabet2(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr2("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i2) => [l, i2]));
  return {
    encode: (digits) => {
      aArr2(digits);
      return digits.map((i2) => {
        if (!Number.isSafeInteger(i2) || i2 < 0 || i2 >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i2}". Allowed: ${letters}`);
        return lettersA[i2];
      });
    },
    decode: (input) => {
      aArr2(input);
      return input.map((letter) => {
        astr2("alphabet.decode", letter);
        const i2 = indexes.get(letter);
        if (i2 === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i2;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join2(separator = "") {
  astr2("join", separator);
  return {
    encode: (from) => {
      astrArr2("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr2("join.decode", to);
      return to.split(separator);
    }
  };
}
var gcd2 = (a, b) => b === 0 ? a : gcd2(b, a % b);
var radix2carry2 = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - gcd2(from, to));
var powers2 = /* @__PURE__ */ (() => {
  let res = [];
  for (let i2 = 0; i2 < 40; i2++)
    res.push(2 ** i2);
  return res;
})();
function convertRadix22(data, from, to, padding2) {
  aArr2(data);
  if (from <= 0 || from > 32)
    throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32)
    throw new Error(`convertRadix2: wrong to=${to}`);
  if (/* @__PURE__ */ radix2carry2(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry2(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const max = powers2[from];
  const mask = powers2[to] - 1;
  const res = [];
  for (const n of data) {
    anumber5(n);
    if (n >= max)
      throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32)
      throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (; pos >= to; pos -= to)
      res.push((carry >> pos - to & mask) >>> 0);
    const pow = powers2[pos];
    if (pow === void 0)
      throw new Error("invalid carry");
    carry &= pow - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding2 && pos >= from)
    throw new Error("Excess padding");
  if (!padding2 && carry > 0)
    throw new Error(`Non-zero padding: ${carry}`);
  if (padding2 && pos > 0)
    res.push(carry >>> 0);
  return res;
}
// @__NO_SIDE_EFFECTS__
function radix22(bits, revPadding = false) {
  anumber5(bits);
  if (bits <= 0 || bits > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ radix2carry2(8, bits) > 32 || /* @__PURE__ */ radix2carry2(bits, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (bytes) => {
      if (!isBytes5(bytes))
        throw new Error("radix2.encode input should be Uint8Array");
      return convertRadix22(Array.from(bytes), 8, bits, !revPadding);
    },
    decode: (digits) => {
      anumArr2("radix2.decode", digits);
      return Uint8Array.from(convertRadix22(digits, bits, 8, revPadding));
    }
  };
}
function unsafeWrapper2(fn) {
  afn2(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
var BECH_ALPHABET2 = /* @__PURE__ */ chain2(/* @__PURE__ */ alphabet2("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ join2(""));
var POLYMOD_GENERATORS2 = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod2(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i2 = 0; i2 < POLYMOD_GENERATORS2.length; i2++) {
    if ((b >> i2 & 1) === 1)
      chk ^= POLYMOD_GENERATORS2[i2];
  }
  return chk;
}
function bechChecksum2(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i2 = 0; i2 < len; i2++) {
    const c = prefix.charCodeAt(i2);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod2(chk) ^ c >> 5;
  }
  chk = bech32Polymod2(chk);
  for (let i2 = 0; i2 < len; i2++)
    chk = bech32Polymod2(chk) ^ prefix.charCodeAt(i2) & 31;
  for (let v of words)
    chk = bech32Polymod2(chk) ^ v;
  for (let i2 = 0; i2 < 6; i2++)
    chk = bech32Polymod2(chk);
  chk ^= encodingConst;
  return BECH_ALPHABET2.encode(convertRadix22([chk % powers2[30]], 30, 5, false));
}
// @__NO_SIDE_EFFECTS__
function genBech322(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = /* @__PURE__ */ radix22(5);
  const fromWords = _words.decode;
  const toWords = _words.encode;
  const fromWordsUnsafe = unsafeWrapper2(fromWords);
  function encode2(prefix, words, limit = 90) {
    astr2("bech32.encode prefix", prefix);
    if (isBytes5(words))
      words = Array.from(words);
    anumArr2("bech32.encode", words);
    const plen = prefix.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    const lowered = prefix.toLowerCase();
    const sum = bechChecksum2(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET2.encode(words)}${sum}`;
  }
  function decode4(str, limit = 90) {
    astr2("bech32.decode input", str);
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length: ${slen} (${str}). Expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered && str !== str.toUpperCase())
      throw new Error(`String must be lowercase or uppercase`);
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`Letter "1" must be present between prefix and data only`);
    const prefix = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const words = BECH_ALPHABET2.decode(data).slice(0, -6);
    const sum = bechChecksum2(prefix, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper2(decode4);
  function decodeToBytes(str) {
    const { prefix, words } = decode4(str, false);
    return { prefix, words, bytes: fromWords(words) };
  }
  function encodeFromBytes(prefix, bytes) {
    return encode2(prefix, toWords(bytes));
  }
  return {
    encode: encode2,
    decode: decode4,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
var bech322 = /* @__PURE__ */ genBech322("bech32");

// ../node_modules/@nostr-dev-kit/ndk/dist/index.mjs
var import_debug12 = __toESM(require_browser(), 1);
var __defProp3 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod3, secondTarget) => (__copyProps2(target, mod3, "default"), secondTarget && __copyProps2(secondTarget, mod3, "default"));
var NDKKind = /* @__PURE__ */ ((NDKKind2) => {
  NDKKind2[NDKKind2["Metadata"] = 0] = "Metadata";
  NDKKind2[NDKKind2["Text"] = 1] = "Text";
  NDKKind2[NDKKind2["RecommendRelay"] = 2] = "RecommendRelay";
  NDKKind2[NDKKind2["Contacts"] = 3] = "Contacts";
  NDKKind2[NDKKind2["EncryptedDirectMessage"] = 4] = "EncryptedDirectMessage";
  NDKKind2[NDKKind2["EventDeletion"] = 5] = "EventDeletion";
  NDKKind2[NDKKind2["Repost"] = 6] = "Repost";
  NDKKind2[NDKKind2["Reaction"] = 7] = "Reaction";
  NDKKind2[NDKKind2["BadgeAward"] = 8] = "BadgeAward";
  NDKKind2[NDKKind2["GroupChat"] = 9] = "GroupChat";
  NDKKind2[NDKKind2["Thread"] = 11] = "Thread";
  NDKKind2[NDKKind2["GroupReply"] = 12] = "GroupReply";
  NDKKind2[NDKKind2["GiftWrapSeal"] = 13] = "GiftWrapSeal";
  NDKKind2[NDKKind2["PrivateDirectMessage"] = 14] = "PrivateDirectMessage";
  NDKKind2[NDKKind2["Image"] = 20] = "Image";
  NDKKind2[NDKKind2["Video"] = 21] = "Video";
  NDKKind2[NDKKind2["ShortVideo"] = 22] = "ShortVideo";
  NDKKind2[NDKKind2["Story"] = 23] = "Story";
  NDKKind2[NDKKind2["Vanish"] = 62] = "Vanish";
  NDKKind2[NDKKind2["CashuWalletBackup"] = 375] = "CashuWalletBackup";
  NDKKind2[NDKKind2["GiftWrap"] = 1059] = "GiftWrap";
  NDKKind2[NDKKind2["GenericRepost"] = 16] = "GenericRepost";
  NDKKind2[NDKKind2["ChannelCreation"] = 40] = "ChannelCreation";
  NDKKind2[NDKKind2["ChannelMetadata"] = 41] = "ChannelMetadata";
  NDKKind2[NDKKind2["ChannelMessage"] = 42] = "ChannelMessage";
  NDKKind2[NDKKind2["ChannelHideMessage"] = 43] = "ChannelHideMessage";
  NDKKind2[NDKKind2["ChannelMuteUser"] = 44] = "ChannelMuteUser";
  NDKKind2[NDKKind2["WikiMergeRequest"] = 818] = "WikiMergeRequest";
  NDKKind2[NDKKind2["GenericReply"] = 1111] = "GenericReply";
  NDKKind2[NDKKind2["Media"] = 1063] = "Media";
  NDKKind2[NDKKind2["VoiceMessage"] = 1222] = "VoiceMessage";
  NDKKind2[NDKKind2["VoiceReply"] = 1244] = "VoiceReply";
  NDKKind2[NDKKind2["DraftCheckpoint"] = 1234] = "DraftCheckpoint";
  NDKKind2[NDKKind2["Task"] = 1934] = "Task";
  NDKKind2[NDKKind2["Report"] = 1984] = "Report";
  NDKKind2[NDKKind2["Label"] = 1985] = "Label";
  NDKKind2[NDKKind2["DVMReqTextExtraction"] = 5e3] = "DVMReqTextExtraction";
  NDKKind2[NDKKind2["DVMReqTextSummarization"] = 5001] = "DVMReqTextSummarization";
  NDKKind2[NDKKind2["DVMReqTextTranslation"] = 5002] = "DVMReqTextTranslation";
  NDKKind2[NDKKind2["DVMReqTextGeneration"] = 5050] = "DVMReqTextGeneration";
  NDKKind2[NDKKind2["DVMReqImageGeneration"] = 5100] = "DVMReqImageGeneration";
  NDKKind2[NDKKind2["DVMReqTextToSpeech"] = 5250] = "DVMReqTextToSpeech";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrContent"] = 5300] = "DVMReqDiscoveryNostrContent";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrPeople"] = 5301] = "DVMReqDiscoveryNostrPeople";
  NDKKind2[NDKKind2["DVMReqTimestamping"] = 5900] = "DVMReqTimestamping";
  NDKKind2[NDKKind2["DVMEventSchedule"] = 5905] = "DVMEventSchedule";
  NDKKind2[NDKKind2["DVMJobFeedback"] = 7e3] = "DVMJobFeedback";
  NDKKind2[NDKKind2["Subscribe"] = 7001] = "Subscribe";
  NDKKind2[NDKKind2["Unsubscribe"] = 7002] = "Unsubscribe";
  NDKKind2[NDKKind2["SubscriptionReceipt"] = 7003] = "SubscriptionReceipt";
  NDKKind2[NDKKind2["CashuReserve"] = 7373] = "CashuReserve";
  NDKKind2[NDKKind2["CashuQuote"] = 7374] = "CashuQuote";
  NDKKind2[NDKKind2["CashuToken"] = 7375] = "CashuToken";
  NDKKind2[NDKKind2["CashuWalletTx"] = 7376] = "CashuWalletTx";
  NDKKind2[NDKKind2["GroupAdminAddUser"] = 9e3] = "GroupAdminAddUser";
  NDKKind2[NDKKind2["GroupAdminRemoveUser"] = 9001] = "GroupAdminRemoveUser";
  NDKKind2[NDKKind2["GroupAdminEditMetadata"] = 9002] = "GroupAdminEditMetadata";
  NDKKind2[NDKKind2["GroupAdminEditStatus"] = 9006] = "GroupAdminEditStatus";
  NDKKind2[NDKKind2["GroupAdminCreateGroup"] = 9007] = "GroupAdminCreateGroup";
  NDKKind2[NDKKind2["GroupAdminRequestJoin"] = 9021] = "GroupAdminRequestJoin";
  NDKKind2[NDKKind2["MuteList"] = 1e4] = "MuteList";
  NDKKind2[NDKKind2["PinList"] = 10001] = "PinList";
  NDKKind2[NDKKind2["RelayList"] = 10002] = "RelayList";
  NDKKind2[NDKKind2["BookmarkList"] = 10003] = "BookmarkList";
  NDKKind2[NDKKind2["CommunityList"] = 10004] = "CommunityList";
  NDKKind2[NDKKind2["PublicChatList"] = 10005] = "PublicChatList";
  NDKKind2[NDKKind2["BlockRelayList"] = 10006] = "BlockRelayList";
  NDKKind2[NDKKind2["SearchRelayList"] = 10007] = "SearchRelayList";
  NDKKind2[NDKKind2["SimpleGroupList"] = 10009] = "SimpleGroupList";
  NDKKind2[NDKKind2["RelayFeedList"] = 10012] = "RelayFeedList";
  NDKKind2[NDKKind2["InterestList"] = 10015] = "InterestList";
  NDKKind2[NDKKind2["CashuMintList"] = 10019] = "CashuMintList";
  NDKKind2[NDKKind2["EmojiList"] = 10030] = "EmojiList";
  NDKKind2[NDKKind2["DirectMessageReceiveRelayList"] = 10050] = "DirectMessageReceiveRelayList";
  NDKKind2[NDKKind2["BlossomList"] = 10063] = "BlossomList";
  NDKKind2[NDKKind2["NostrWaletConnectInfo"] = 13194] = "NostrWaletConnectInfo";
  NDKKind2[NDKKind2["TierList"] = 17e3] = "TierList";
  NDKKind2[NDKKind2["CashuWallet"] = 17375] = "CashuWallet";
  NDKKind2[NDKKind2["FollowSet"] = 3e4] = "FollowSet";
  NDKKind2[
    NDKKind2["CategorizedPeopleList"] = 3e4
    /* FollowSet */
  ] = "CategorizedPeopleList";
  NDKKind2[NDKKind2["CategorizedBookmarkList"] = 30001] = "CategorizedBookmarkList";
  NDKKind2[NDKKind2["RelaySet"] = 30002] = "RelaySet";
  NDKKind2[
    NDKKind2["CategorizedRelayList"] = 30002
    /* RelaySet */
  ] = "CategorizedRelayList";
  NDKKind2[NDKKind2["BookmarkSet"] = 30003] = "BookmarkSet";
  NDKKind2[NDKKind2["CurationSet"] = 30004] = "CurationSet";
  NDKKind2[NDKKind2["ArticleCurationSet"] = 30004] = "ArticleCurationSet";
  NDKKind2[NDKKind2["VideoCurationSet"] = 30005] = "VideoCurationSet";
  NDKKind2[NDKKind2["ImageCurationSet"] = 30006] = "ImageCurationSet";
  NDKKind2[NDKKind2["InterestSet"] = 30015] = "InterestSet";
  NDKKind2[
    NDKKind2["InterestsList"] = 30015
    /* InterestSet */
  ] = "InterestsList";
  NDKKind2[NDKKind2["ProjectTemplate"] = 30717] = "ProjectTemplate";
  NDKKind2[NDKKind2["EmojiSet"] = 30030] = "EmojiSet";
  NDKKind2[NDKKind2["ModularArticle"] = 30040] = "ModularArticle";
  NDKKind2[NDKKind2["ModularArticleItem"] = 30041] = "ModularArticleItem";
  NDKKind2[NDKKind2["Wiki"] = 30818] = "Wiki";
  NDKKind2[NDKKind2["Draft"] = 31234] = "Draft";
  NDKKind2[NDKKind2["Project"] = 31933] = "Project";
  NDKKind2[NDKKind2["SubscriptionTier"] = 37001] = "SubscriptionTier";
  NDKKind2[NDKKind2["EcashMintRecommendation"] = 38e3] = "EcashMintRecommendation";
  NDKKind2[NDKKind2["CashuMintAnnouncement"] = 38172] = "CashuMintAnnouncement";
  NDKKind2[NDKKind2["FedimintMintAnnouncement"] = 38173] = "FedimintMintAnnouncement";
  NDKKind2[NDKKind2["P2POrder"] = 38383] = "P2POrder";
  NDKKind2[NDKKind2["HighlightSet"] = 39802] = "HighlightSet";
  NDKKind2[
    NDKKind2["CategorizedHighlightList"] = 39802
    /* HighlightSet */
  ] = "CategorizedHighlightList";
  NDKKind2[NDKKind2["Nutzap"] = 9321] = "Nutzap";
  NDKKind2[NDKKind2["ZapRequest"] = 9734] = "ZapRequest";
  NDKKind2[NDKKind2["Zap"] = 9735] = "Zap";
  NDKKind2[NDKKind2["Highlight"] = 9802] = "Highlight";
  NDKKind2[NDKKind2["ClientAuth"] = 22242] = "ClientAuth";
  NDKKind2[NDKKind2["NostrWalletConnectReq"] = 23194] = "NostrWalletConnectReq";
  NDKKind2[NDKKind2["NostrWalletConnectRes"] = 23195] = "NostrWalletConnectRes";
  NDKKind2[NDKKind2["NostrConnect"] = 24133] = "NostrConnect";
  NDKKind2[NDKKind2["BlossomUpload"] = 24242] = "BlossomUpload";
  NDKKind2[NDKKind2["HttpAuth"] = 27235] = "HttpAuth";
  NDKKind2[NDKKind2["ProfileBadge"] = 30008] = "ProfileBadge";
  NDKKind2[NDKKind2["BadgeDefinition"] = 30009] = "BadgeDefinition";
  NDKKind2[NDKKind2["MarketStall"] = 30017] = "MarketStall";
  NDKKind2[NDKKind2["MarketProduct"] = 30018] = "MarketProduct";
  NDKKind2[NDKKind2["Article"] = 30023] = "Article";
  NDKKind2[NDKKind2["AppSpecificData"] = 30078] = "AppSpecificData";
  NDKKind2[NDKKind2["Classified"] = 30402] = "Classified";
  NDKKind2[NDKKind2["HorizontalVideo"] = 34235] = "HorizontalVideo";
  NDKKind2[NDKKind2["VerticalVideo"] = 34236] = "VerticalVideo";
  NDKKind2[NDKKind2["GroupMetadata"] = 39e3] = "GroupMetadata";
  NDKKind2[NDKKind2["GroupAdmins"] = 39001] = "GroupAdmins";
  NDKKind2[NDKKind2["GroupMembers"] = 39002] = "GroupMembers";
  NDKKind2[NDKKind2["FollowPack"] = 39089] = "FollowPack";
  NDKKind2[NDKKind2["MediaFollowPack"] = 39092] = "MediaFollowPack";
  NDKKind2[NDKKind2["AppRecommendation"] = 31989] = "AppRecommendation";
  NDKKind2[NDKKind2["AppHandler"] = 31990] = "AppHandler";
  return NDKKind2;
})(NDKKind || {});
var NDKListKinds = [
  1e4,
  10001,
  10002,
  10003,
  10004,
  10005,
  10006,
  10007,
  10012,
  10015,
  10030,
  10050,
  3e4,
  30003,
  30001,
  // Backwards compatibility
  30002,
  30004,
  30005,
  30015,
  30030,
  39802
  /* HighlightSet */
];
var NdkNutzapStatus = /* @__PURE__ */ ((NdkNutzapStatus2) => {
  NdkNutzapStatus2["INITIAL"] = "initial";
  NdkNutzapStatus2["PROCESSING"] = "processing";
  NdkNutzapStatus2["REDEEMED"] = "redeemed";
  NdkNutzapStatus2["SPENT"] = "spent";
  NdkNutzapStatus2["MISSING_PRIVKEY"] = "missing_privkey";
  NdkNutzapStatus2["TEMPORARY_ERROR"] = "temporary_error";
  NdkNutzapStatus2["PERMANENT_ERROR"] = "permanent_error";
  NdkNutzapStatus2["INVALID_NUTZAP"] = "invalid_nutzap";
  return NdkNutzapStatus2;
})(NdkNutzapStatus || {});
function getRelaysForSync(ndk, author, type = "write") {
  if (!ndk.outboxTracker) return void 0;
  const item = ndk.outboxTracker.data.get(author);
  if (!item) return void 0;
  if (type === "write") {
    return item.writeRelays;
  }
  return item.readRelays;
}
async function getWriteRelaysFor(ndk, author, type = "write") {
  if (!ndk.outboxTracker) return void 0;
  if (!ndk.outboxTracker.data.has(author)) {
    await ndk.outboxTracker.trackUsers([author]);
  }
  return getRelaysForSync(ndk, author, type);
}
function getTopRelaysForAuthors(ndk, authors) {
  const relaysWithCount = /* @__PURE__ */ new Map();
  authors.forEach((author) => {
    const writeRelays = getRelaysForSync(ndk, author);
    if (writeRelays) {
      writeRelays.forEach((relay) => {
        const count = relaysWithCount.get(relay) || 0;
        relaysWithCount.set(relay, count + 1);
      });
    }
  });
  const sortedRelays = Array.from(relaysWithCount.entries()).sort((a, b) => b[1] - a[1]);
  return sortedRelays.map((entry) => entry[0]);
}
function getAllRelaysForAllPubkeys(ndk, pubkeys, type = "read") {
  const pubkeysToRelays = /* @__PURE__ */ new Map();
  const authorsMissingRelays = /* @__PURE__ */ new Set();
  pubkeys.forEach((pubkey) => {
    const relays = getRelaysForSync(ndk, pubkey, type);
    if (relays && relays.size > 0) {
      relays.forEach((relay) => {
        const pubkeysInRelay = pubkeysToRelays.get(relay) || /* @__PURE__ */ new Set();
        pubkeysInRelay.add(pubkey);
      });
      pubkeysToRelays.set(pubkey, relays);
    } else {
      authorsMissingRelays.add(pubkey);
    }
  });
  return { pubkeysToRelays, authorsMissingRelays };
}
function chooseRelayCombinationForPubkeys(ndk, pubkeys, type, { count, preferredRelays } = {}) {
  count ??= 2;
  preferredRelays ??= /* @__PURE__ */ new Set();
  const pool = ndk.pool;
  const connectedRelays = pool.connectedRelays();
  connectedRelays.forEach((relay) => {
    preferredRelays?.add(relay.url);
  });
  const relayToAuthorsMap = /* @__PURE__ */ new Map();
  const { pubkeysToRelays, authorsMissingRelays } = getAllRelaysForAllPubkeys(ndk, pubkeys, type);
  const sortedRelays = getTopRelaysForAuthors(ndk, pubkeys);
  const addAuthorToRelay = (author, relay) => {
    const authorsInRelay = relayToAuthorsMap.get(relay) || [];
    authorsInRelay.push(author);
    relayToAuthorsMap.set(relay, authorsInRelay);
  };
  for (const [author, authorRelays] of pubkeysToRelays.entries()) {
    let missingRelayCount = count;
    const addedRelaysForAuthor = /* @__PURE__ */ new Set();
    for (const relay of connectedRelays) {
      if (authorRelays.has(relay.url)) {
        addAuthorToRelay(author, relay.url);
        addedRelaysForAuthor.add(relay.url);
        missingRelayCount--;
      }
    }
    for (const authorRelay of authorRelays) {
      if (addedRelaysForAuthor.has(authorRelay)) continue;
      if (relayToAuthorsMap.has(authorRelay)) {
        addAuthorToRelay(author, authorRelay);
        addedRelaysForAuthor.add(authorRelay);
        missingRelayCount--;
      }
    }
    if (missingRelayCount <= 0) continue;
    for (const relay of sortedRelays) {
      if (missingRelayCount <= 0) break;
      if (addedRelaysForAuthor.has(relay)) continue;
      if (authorRelays.has(relay)) {
        addAuthorToRelay(author, relay);
        addedRelaysForAuthor.add(relay);
        missingRelayCount--;
      }
    }
  }
  for (const author of authorsMissingRelays) {
    pool.permanentAndConnectedRelays().forEach((relay) => {
      const authorsInRelay = relayToAuthorsMap.get(relay.url) || [];
      authorsInRelay.push(author);
      relayToAuthorsMap.set(relay.url, authorsInRelay);
    });
  }
  return relayToAuthorsMap;
}
function getRelaysForFilterWithAuthors(ndk, authors, relayGoalPerAuthor = 2) {
  return chooseRelayCombinationForPubkeys(ndk, authors, "write", { count: relayGoalPerAuthor });
}
function tryNormalizeRelayUrl(url) {
  try {
    return normalizeRelayUrl(url);
  } catch {
    return void 0;
  }
}
function normalizeRelayUrl(url) {
  let r = normalizeUrl(url, {
    stripAuthentication: false,
    stripWWW: false,
    stripHash: true
  });
  if (!r.endsWith("/")) {
    r += "/";
  }
  return r;
}
function normalize(urls) {
  const normalized = /* @__PURE__ */ new Set();
  for (const url of urls) {
    try {
      normalized.add(normalizeRelayUrl(url));
    } catch {
    }
  }
  return Array.from(normalized);
}
var DATA_URL_DEFAULT_MIME_TYPE = "text/plain";
var DATA_URL_DEFAULT_CHARSET = "us-ascii";
var testParameter = (name, filters) => filters.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name);
var supportedProtocols = /* @__PURE__ */ new Set(["https:", "http:", "file:"]);
var hasCustomProtocol = (urlString) => {
  try {
    const { protocol } = new URL(urlString);
    return protocol.endsWith(":") && !protocol.includes(".") && !supportedProtocols.has(protocol);
  } catch {
    return false;
  }
};
var normalizeDataURL = (urlString, { stripHash }) => {
  const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);
  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`);
  }
  const type = match.groups?.type ?? "";
  const data = match.groups?.data ?? "";
  let hash = match.groups?.hash ?? "";
  const mediaType = type.split(";");
  hash = stripHash ? "" : hash;
  let isBase64 = false;
  if (mediaType[mediaType.length - 1] === "base64") {
    mediaType.pop();
    isBase64 = true;
  }
  const mimeType = mediaType.shift()?.toLowerCase() ?? "";
  const attributes = mediaType.map((attribute) => {
    let [key, value = ""] = attribute.split("=").map((string) => string.trim());
    if (key === "charset") {
      value = value.toLowerCase();
      if (value === DATA_URL_DEFAULT_CHARSET) {
        return "";
      }
    }
    return `${key}${value ? `=${value}` : ""}`;
  }).filter(Boolean);
  const normalizedMediaType = [...attributes];
  if (isBase64) {
    normalizedMediaType.push("base64");
  }
  if (normalizedMediaType.length > 0 || mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE) {
    normalizedMediaType.unshift(mimeType);
  }
  return `data:${normalizedMediaType.join(";")},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ""}`;
};
function normalizeUrl(urlString, options = {}) {
  options = {
    defaultProtocol: "http",
    normalizeProtocol: true,
    forceHttp: false,
    forceHttps: false,
    stripAuthentication: true,
    stripHash: false,
    stripTextFragment: true,
    stripWWW: true,
    removeQueryParameters: [/^utm_\w+/i],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeDirectoryIndex: false,
    removeExplicitPort: false,
    sortQueryParameters: true,
    ...options
  };
  if (typeof options.defaultProtocol === "string" && !options.defaultProtocol.endsWith(":")) {
    options.defaultProtocol = `${options.defaultProtocol}:`;
  }
  urlString = urlString.trim();
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options);
  }
  if (hasCustomProtocol(urlString)) {
    return urlString;
  }
  const hasRelativeProtocol = urlString.startsWith("//");
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);
  if (!isRelativeUrl) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
  }
  const urlObject = new URL(urlString);
  urlObject.hostname = urlObject.hostname.toLowerCase();
  if (options.forceHttp && options.forceHttps) {
    throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");
  }
  if (options.forceHttp && urlObject.protocol === "https:") {
    urlObject.protocol = "http:";
  }
  if (options.forceHttps && urlObject.protocol === "http:") {
    urlObject.protocol = "https:";
  }
  if (options.stripAuthentication) {
    urlObject.username = "";
    urlObject.password = "";
  }
  if (options.stripHash) {
    urlObject.hash = "";
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, "");
  }
  if (urlObject.pathname) {
    const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;
    let lastIndex = 0;
    let result = "";
    for (; ; ) {
      const match = protocolRegex.exec(urlObject.pathname);
      if (!match) {
        break;
      }
      const protocol = match[0];
      const protocolAtIndex = match.index;
      const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);
      result += intermediate.replace(/\/{2,}/g, "/");
      result += protocol;
      lastIndex = protocolAtIndex + protocol.length;
    }
    const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length);
    result += remnant.replace(/\/{2,}/g, "/");
    urlObject.pathname = result;
  }
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname);
    } catch {
    }
  }
  if (options.removeDirectoryIndex === true) {
    options.removeDirectoryIndex = [/^index\.[a-z]+$/];
  }
  if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    let pathComponents = urlObject.pathname.split("/");
    const lastComponent = pathComponents[pathComponents.length - 1];
    if (testParameter(lastComponent, options.removeDirectoryIndex)) {
      pathComponents = pathComponents.slice(0, -1);
      urlObject.pathname = `${pathComponents.slice(1).join("/")}/`;
    }
  }
  if (urlObject.hostname) {
    urlObject.hostname = urlObject.hostname.replace(/\.$/, "");
    if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
      urlObject.hostname = urlObject.hostname.replace(/^www\./, "");
    }
  }
  if (Array.isArray(options.removeQueryParameters)) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
    urlObject.search = "";
  }
  if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (!testParameter(key, options.keepQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (options.sortQueryParameters) {
    urlObject.searchParams.sort();
    try {
      urlObject.search = decodeURIComponent(urlObject.search);
    } catch {
    }
  }
  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(/\/$/, "");
  }
  if (options.removeExplicitPort && urlObject.port) {
    urlObject.port = "";
  }
  const oldUrlString = urlString;
  urlString = urlObject.toString();
  if (!options.removeSingleSlash && urlObject.pathname === "/" && !oldUrlString.endsWith("/") && urlObject.hash === "") {
    urlString = urlString.replace(/\/$/, "");
  }
  if ((options.removeTrailingSlash || urlObject.pathname === "/") && urlObject.hash === "" && options.removeSingleSlash) {
    urlString = urlString.replace(/\/$/, "");
  }
  if (hasRelativeProtocol && !options.normalizeProtocol) {
    urlString = urlString.replace(/^http:\/\//, "//");
  }
  if (options.stripProtocol) {
    urlString = urlString.replace(/^(?:https?:)?\/\//, "");
  }
  return urlString;
}
var HLL_REGISTER_COUNT = 256;
var NDKCountHll = class _NDKCountHll {
  /**
   * The 256 uint8 registers used for HLL estimation
   */
  registers;
  constructor(registers) {
    if (registers) {
      if (registers.length !== HLL_REGISTER_COUNT) {
        throw new Error(`HLL must have exactly ${HLL_REGISTER_COUNT} registers, got ${registers.length}`);
      }
      this.registers = registers;
    } else {
      this.registers = new Uint8Array(HLL_REGISTER_COUNT);
    }
  }
  /**
   * Creates an NDKCountHll from a hex-encoded string (512 characters).
   * Each register is a uint8 value encoded as 2 hex characters.
   *
   * @param hex - The hex string (512 characters = 256 bytes)
   * @returns A new NDKCountHll instance
   * @throws Error if the hex string is invalid
   */
  static fromHex(hex) {
    if (hex.length !== HLL_REGISTER_COUNT * 2) {
      throw new Error(`HLL hex string must be ${HLL_REGISTER_COUNT * 2} characters, got ${hex.length}`);
    }
    const registers = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0; i2 < HLL_REGISTER_COUNT; i2++) {
      registers[i2] = parseInt(hex.substring(i2 * 2, i2 * 2 + 2), 16);
    }
    return new _NDKCountHll(registers);
  }
  /**
   * Converts the HLL registers to a hex-encoded string.
   *
   * @returns The hex string representation (512 characters)
   */
  toHex() {
    return Array.from(this.registers).map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  /**
   * Merges this HLL with another HLL by taking the maximum value for each register.
   * This is the standard HLL merge operation that allows combining counts
   * from multiple relays without double-counting.
   *
   * @param other - The other HLL to merge with
   * @returns A new NDKCountHll with the merged registers
   */
  merge(other) {
    const merged = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0; i2 < HLL_REGISTER_COUNT; i2++) {
      merged[i2] = Math.max(this.registers[i2], other.registers[i2]);
    }
    return new _NDKCountHll(merged);
  }
  /**
   * Merges multiple HLLs by taking the maximum value for each register.
   *
   * @param hlls - Array of HLLs to merge
   * @returns A new NDKCountHll with the merged registers
   */
  static merge(hlls) {
    if (hlls.length === 0) {
      return new _NDKCountHll();
    }
    const merged = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0; i2 < HLL_REGISTER_COUNT; i2++) {
      merged[i2] = Math.max(...hlls.map((hll) => hll.registers[i2]));
    }
    return new _NDKCountHll(merged);
  }
  /**
   * Estimates the cardinality (unique count) using the HyperLogLog algorithm.
   *
   * Uses the standard HLL formula with bias correction for small and large cardinalities.
   *
   * @returns The estimated unique count
   */
  estimate() {
    const m = HLL_REGISTER_COUNT;
    const alpha = 0.7213 / (1 + 1.079 / m);
    let sum = 0;
    let zeros = 0;
    for (let i2 = 0; i2 < m; i2++) {
      sum += Math.pow(2, -this.registers[i2]);
      if (this.registers[i2] === 0) {
        zeros++;
      }
    }
    let estimate = alpha * m * m / sum;
    if (estimate <= 2.5 * m && zeros > 0) {
      estimate = m * Math.log(m / zeros);
    }
    return Math.round(estimate);
  }
  /**
   * Checks if this HLL is empty (all registers are zero).
   *
   * @returns True if all registers are zero
   */
  isEmpty() {
    return this.registers.every((v) => v === 0);
  }
  /**
   * Creates a copy of this HLL.
   *
   * @returns A new NDKCountHll with the same register values
   */
  clone() {
    return new _NDKCountHll(new Uint8Array(this.registers));
  }
};
var NDKRelayKeepalive = class {
  /**
   * @param timeout - Time in milliseconds to wait before considering connection stale (default 30s)
   * @param onSilenceDetected - Callback when silence is detected
   */
  constructor(timeout = 3e4, onSilenceDetected) {
    this.onSilenceDetected = onSilenceDetected;
    this.timeout = timeout;
  }
  lastActivity = Date.now();
  timer;
  timeout;
  isRunning = false;
  /**
   * Records activity from the relay, resetting the silence timer
   */
  recordActivity() {
    this.lastActivity = Date.now();
    if (this.isRunning) {
      this.resetTimer();
    }
  }
  /**
   * Starts monitoring for relay silence
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastActivity = Date.now();
    this.resetTimer();
  }
  /**
   * Stops monitoring for relay silence
   */
  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
  }
  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      const silenceTime = Date.now() - this.lastActivity;
      if (silenceTime >= this.timeout) {
        this.onSilenceDetected();
      } else {
        const remainingTime = this.timeout - silenceTime;
        this.timer = setTimeout(() => {
          this.onSilenceDetected();
        }, remainingTime);
      }
    }, this.timeout);
  }
};
async function probeRelayConnection(relay) {
  const probeId = `probe-${Math.random().toString(36).substring(7)}`;
  return new Promise((resolve) => {
    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        relay.send(["CLOSE", probeId]);
        resolve(false);
      }
    }, 5e3);
    const handler = () => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        relay.send(["CLOSE", probeId]);
        resolve(true);
      }
    };
    relay.once("message", handler);
    relay.send([
      "REQ",
      probeId,
      {
        kinds: [99999],
        limit: 0
      }
    ]);
  });
}
var FLAPPING_THRESHOLD_MS = 1e3;
var NDKRelayConnectivity = class {
  ndkRelay;
  ws;
  _status;
  timeoutMs;
  connectedAt;
  _connectionStats = {
    attempts: 0,
    success: 0,
    durations: []
  };
  debug;
  netDebug;
  connectTimeout;
  reconnectTimeout;
  ndk;
  openSubs = /* @__PURE__ */ new Map();
  openCountRequests = /* @__PURE__ */ new Map();
  openEventPublishes = /* @__PURE__ */ new Map();
  pendingAuthPublishes = /* @__PURE__ */ new Map();
  serial = 0;
  baseEoseTimeout = 4400;
  // Keepalive and monitoring
  keepalive;
  wsStateMonitor;
  sleepDetector;
  lastSleepCheck = Date.now();
  lastMessageSent = Date.now();
  wasIdle = false;
  constructor(ndkRelay, ndk) {
    this.ndkRelay = ndkRelay;
    this._status = 1;
    const rand = Math.floor(Math.random() * 1e3);
    this.debug = this.ndkRelay.debug.extend(`connectivity${rand}`);
    this.ndk = ndk;
    this.setupMonitoring();
  }
  /**
   * Sets up keepalive, WebSocket state monitoring, and sleep detection
   */
  setupMonitoring() {
    this.keepalive = new NDKRelayKeepalive(12e4, async () => {
      this.debug("Relay silence detected, probing connection");
      const isAlive = await probeRelayConnection({
        send: (msg) => this.send(JSON.stringify(msg)),
        once: (event, handler) => {
          const messageHandler = (e) => {
            try {
              const data = JSON.parse(e.data);
              if (data[0] === "EOSE" || data[0] === "EVENT" || data[0] === "NOTICE") {
                handler();
                this.ws?.removeEventListener("message", messageHandler);
              }
            } catch {
            }
          };
          this.ws?.addEventListener("message", messageHandler);
        }
      });
      if (!isAlive) {
        this.debug("Probe failed, connection is stale");
        this.handleStaleConnection();
      }
    });
    this.wsStateMonitor = setInterval(() => {
      if (this._status === 5) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          this.debug("WebSocket died silently, reconnecting");
          this.handleStaleConnection();
        }
      }
    }, 5e3);
    this.sleepDetector = setInterval(() => {
      const now2 = Date.now();
      const elapsed = now2 - this.lastSleepCheck;
      if (elapsed > 15e3) {
        this.debug(`Detected possible sleep/wake (${elapsed}ms gap)`);
        this.handlePossibleWake();
      }
      this.lastSleepCheck = now2;
    }, 1e4);
  }
  /**
   * Handles detection of a stale connection by cleaning up and triggering reconnection.
   */
  handleStaleConnection() {
    this.wasIdle = true;
    this.keepalive?.stop();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
      }
      this.ws = void 0;
    }
    this._status = 1;
    this.ndkRelay.emit("disconnect");
    this.handleReconnection();
  }
  /**
   * Handles possible system wake event
   */
  handlePossibleWake() {
    this.debug("System wake detected, checking all connections");
    this.wasIdle = true;
    if (this._status >= 5) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.handleStaleConnection();
      } else {
        probeRelayConnection({
          send: (msg) => this.send(JSON.stringify(msg)),
          once: (event, handler) => {
            const messageHandler = (e) => {
              try {
                const data = JSON.parse(e.data);
                if (data[0] === "EOSE" || data[0] === "EVENT" || data[0] === "NOTICE") {
                  handler();
                  this.ws?.removeEventListener("message", messageHandler);
                }
              } catch {
              }
            };
            this.ws?.addEventListener("message", messageHandler);
          }
        }).then((isAlive) => {
          if (!isAlive) {
            this.handleStaleConnection();
          }
        });
      }
    }
  }
  /**
   * Resets the reconnection state for system-wide events
   * Used by NDKPool when detecting system sleep/wake
   */
  resetReconnectionState() {
    this.wasIdle = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = void 0;
    }
  }
  /**
   * Connects to the NDK relay and handles the connection lifecycle.
   *
   * This method attempts to establish a WebSocket connection to the NDK relay specified in the `ndkRelay` object.
   * If the connection is successful, it updates the connection statistics, sets the connection status to `CONNECTED`,
   * and emits `connect` and `ready` events on the `ndkRelay` object.
   *
   * If the connection attempt fails, it handles the error by either initiating a reconnection attempt or emitting a
   * `delayed-connect` event on the `ndkRelay` object, depending on the `reconnect` parameter.
   *
   * @param timeoutMs - The timeout in milliseconds for the connection attempt. If not provided, the default timeout from the `ndkRelay` object is used.
   * @param reconnect - Indicates whether a reconnection should be attempted if the connection fails. Defaults to `true`.
   * @returns A Promise that resolves when the connection is established, or rejects if the connection fails.
   */
  async connect(timeoutMs, reconnect = true) {
    if (this.ws && this.ws.readyState !== WebSocket.OPEN && this.ws.readyState !== WebSocket.CONNECTING) {
      this.debug("Cleaning up stale WebSocket connection");
      try {
        this.ws.close();
      } catch (e) {
      }
      this.ws = void 0;
      this._status = 1;
    }
    if (this._status !== 2 && this._status !== 1 || this.reconnectTimeout) {
      this.debug(
        "Relay requested to be connected but was in state %s or it had a reconnect timeout",
        this._status
      );
      return;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = void 0;
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = void 0;
    }
    timeoutMs ??= this.timeoutMs;
    if (!this.timeoutMs && timeoutMs) this.timeoutMs = timeoutMs;
    if (this.timeoutMs) this.connectTimeout = setTimeout(() => this.onConnectionError(reconnect), this.timeoutMs);
    try {
      this.updateConnectionStats.attempt();
      if (this._status === 1) this._status = 4;
      else this._status = 2;
      this.ws = new WebSocket(this.ndkRelay.url);
      this.ws.onopen = this.onConnect.bind(this);
      this.ws.onclose = this.onDisconnect.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (e) {
      this.debug(`Failed to connect to ${this.ndkRelay.url}`, e);
      this._status = 1;
      if (reconnect) this.handleReconnection();
      else this.ndkRelay.emit("delayed-connect", 2 * 24 * 60 * 60 * 1e3);
      throw e;
    }
  }
  /**
   * Disconnects the WebSocket connection to the NDK relay.
   * This method sets the connection status to `NDKRelayStatus.DISCONNECTING`,
   * attempts to close the WebSocket connection, and sets the status to
   * `NDKRelayStatus.DISCONNECTED` if the disconnect operation fails.
   */
  disconnect() {
    this._status = 0;
    this.keepalive?.stop();
    if (this.wsStateMonitor) {
      clearInterval(this.wsStateMonitor);
      this.wsStateMonitor = void 0;
    }
    if (this.sleepDetector) {
      clearInterval(this.sleepDetector);
      this.sleepDetector = void 0;
    }
    try {
      this.ws?.close();
    } catch (e) {
      this.debug("Failed to disconnect", e);
      this._status = 1;
    }
  }
  /**
   * Handles the error that occurred when attempting to connect to the NDK relay.
   * If `reconnect` is `true`, this method will initiate a reconnection attempt.
   * Otherwise, it will emit a `delayed-connect` event on the `ndkRelay` object,
   * indicating that a reconnection should be attempted after a delay.
   *
   * @param reconnect - Indicates whether a reconnection should be attempted.
   */
  onConnectionError(reconnect) {
    this.debug(`Error connecting to ${this.ndkRelay.url}`, this.timeoutMs);
    if (reconnect && !this.reconnectTimeout) {
      this.handleReconnection();
    }
  }
  /**
   * Handles the connection event when the WebSocket connection is established.
   * This method is called when the WebSocket connection is successfully opened.
   * It clears any existing connection and reconnection timeouts, updates the connection statistics,
   * sets the connection status to `CONNECTED`, and emits `connect` and `ready` events on the `ndkRelay` object.
   */
  onConnect() {
    this.netDebug?.("connected", this.ndkRelay);
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = void 0;
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = void 0;
    }
    this.updateConnectionStats.connected();
    this._status = 5;
    this.keepalive?.start();
    this.wasIdle = false;
    this.ndkRelay.emit("connect");
    this.ndkRelay.emit("ready");
  }
  /**
   * Handles the disconnection event when the WebSocket connection is closed.
   * This method is called when the WebSocket connection is successfully closed.
   * It updates the connection statistics, sets the connection status to `DISCONNECTED`,
   * initiates a reconnection attempt if we didn't disconnect ourselves,
   * and emits a `disconnect` event on the `ndkRelay` object.
   */
  onDisconnect() {
    this.netDebug?.("disconnected", this.ndkRelay);
    this.updateConnectionStats.disconnected();
    this.keepalive?.stop();
    this.clearPendingPublishes(new Error(`Relay ${this.ndkRelay.url} disconnected`));
    if (this._status === 5) {
      this.handleReconnection();
    }
    this._status = 1;
    this.ndkRelay.emit("disconnect");
  }
  /**
   * Handles incoming messages from the NDK relay WebSocket connection.
   * This method is called whenever a message is received from the relay.
   * It parses the message data and dispatches the appropriate handling logic based on the message type.
   *
   * @param event - The MessageEvent containing the received message data.
   */
  onMessage(event) {
    this.netDebug?.(event.data, this.ndkRelay, "recv");
    this.keepalive?.recordActivity();
    try {
      const data = JSON.parse(event.data);
      const [cmd, id, ..._rest] = data;
      const handler = this.ndkRelay.getProtocolHandler(cmd);
      if (handler) {
        handler(this.ndkRelay, data);
        return;
      }
      switch (cmd) {
        case "EVENT": {
          const so = this.openSubs.get(id);
          const event2 = data[2];
          if (!so) {
            this.debug(`Received event for unknown subscription ${id}`);
            return;
          }
          so.onevent(event2);
          return;
        }
        case "COUNT": {
          const payload = data[2];
          const cr = this.openCountRequests.get(id);
          if (cr) {
            const result = { count: payload.count };
            if (payload.hll) {
              try {
                result.hll = NDKCountHll.fromHex(payload.hll);
              } catch (e) {
                this.debug("Failed to parse HLL from COUNT response:", e);
              }
            }
            cr.resolve(result);
            this.openCountRequests.delete(id);
          }
          return;
        }
        case "EOSE": {
          const so = this.openSubs.get(id);
          if (!so) return;
          so.oneose(id);
          return;
        }
        case "OK": {
          const ok = data[2];
          const reason = data[3];
          const ep = this.openEventPublishes.get(id);
          const firstEp = ep?.pop();
          if (!ep || !firstEp) {
            this.debug("Received OK for unknown event publish", id);
            return;
          }
          if (ok) {
            firstEp.resolve(reason);
            this.pendingAuthPublishes.delete(id);
          } else {
            const isAuthRequired = reason && (reason.toLowerCase().includes("auth-required") || reason.toLowerCase().includes("not authorized") || reason.toLowerCase().includes("blocked: not authorized"));
            if (isAuthRequired) {
              const event2 = this.pendingAuthPublishes.get(id);
              if (event2) {
                this.debug("Publish failed due to auth-required, will retry after auth", id);
                ep.push(firstEp);
                this.openEventPublishes.set(id, ep);
              } else {
                firstEp.reject(new Error(reason));
              }
            } else {
              firstEp.reject(new Error(reason));
              this.pendingAuthPublishes.delete(id);
            }
          }
          if (ep.length === 0) {
            this.openEventPublishes.delete(id);
          } else if (!ok && !(reason?.toLowerCase().includes("auth-required") || reason?.toLowerCase().includes("not authorized") || reason?.toLowerCase().includes("blocked: not authorized"))) {
            this.openEventPublishes.set(id, ep);
          }
          return;
        }
        case "CLOSED": {
          const so = this.openSubs.get(id);
          if (!so) return;
          so.onclosed(data[2]);
          return;
        }
        case "NOTICE":
          this.onNotice(data[1]);
          return;
        case "AUTH": {
          this.onAuthRequested(data[1]);
          return;
        }
      }
    } catch (error) {
      this.debug(`Error parsing message from ${this.ndkRelay.url}: ${error.message}`, error?.stack);
      return;
    }
  }
  /**
   * Handles an authentication request from the NDK relay.
   *
   * If an authentication policy is configured, it will be used to authenticate the connection.
   * Otherwise, the `auth` event will be emitted to allow the application to handle the authentication.
   *
   * @param challenge - The authentication challenge provided by the NDK relay.
   */
  async onAuthRequested(challenge3) {
    const authPolicy = this.ndkRelay.authPolicy ?? this.ndk?.relayAuthDefaultPolicy;
    this.debug("Relay requested authentication", {
      havePolicy: !!authPolicy
    });
    if (this._status === 7) {
      this.debug("Already authenticating, ignoring");
      return;
    }
    this._status = 6;
    if (authPolicy) {
      if (this._status >= 5) {
        this._status = 7;
        let res;
        try {
          res = await authPolicy(this.ndkRelay, challenge3);
        } catch (e) {
          this.debug("Authentication policy threw an error", e);
          res = false;
        }
        this.debug("Authentication policy returned", !!res);
        if (res instanceof NDKEvent || res === true) {
          if (res instanceof NDKEvent) {
            await this.auth(res);
          }
          const authenticate = async () => {
            if (this._status >= 5 && this._status < 8) {
              const event = new NDKEvent(this.ndk);
              event.kind = 22242;
              event.tags = [
                ["relay", this.ndkRelay.url],
                ["challenge", challenge3]
              ];
              await event.sign();
              this.auth(event).then(() => {
                this._status = 8;
                this.ndkRelay.emit("authed");
                this.debug("Authentication successful");
                this.retryPendingAuthPublishes();
              }).catch((e) => {
                this._status = 6;
                this.ndkRelay.emit("auth:failed", e);
                this.debug("Authentication failed", e);
                this.rejectPendingAuthPublishes(e);
              });
            } else {
              this.debug("Authentication failed, it changed status, status is %d", this._status);
            }
          };
          if (res === true) {
            if (!this.ndk?.signer) {
              this.debug("No signer available for authentication localhost");
              this.ndk?.once("signer:ready", authenticate);
            } else {
              authenticate().catch((e) => {
                console.error("Error authenticating", e);
              });
            }
          }
          this._status = 5;
          this.ndkRelay.emit("authed");
        }
      }
    } else {
      this.ndkRelay.emit("auth", challenge3);
    }
  }
  /**
   * Handles errors that occur on the WebSocket connection to the relay.
   * @param error - The error or event that occurred.
   */
  onError(error) {
    this.debug(`WebSocket error on ${this.ndkRelay.url}:`, error);
  }
  /**
   * Gets the current status of the NDK relay connection.
   * @returns {NDKRelayStatus} The current status of the NDK relay connection.
   */
  get status() {
    return this._status;
  }
  /**
   * Checks if the NDK relay connection is currently available.
   * @returns {boolean} `true` if the relay connection is in the `CONNECTED` status, `false` otherwise.
   */
  isAvailable() {
    return this._status === 5;
  }
  /**
   * Checks if the NDK relay connection is flapping, which means the connection is rapidly
   * disconnecting and reconnecting. This is determined by analyzing the durations of the
   * last three connection attempts. If the standard deviation of the durations is less
   * than 1000 milliseconds, the connection is considered to be flapping.
   *
   * @returns {boolean} `true` if the connection is flapping, `false` otherwise.
   */
  isFlapping() {
    const durations = this._connectionStats.durations;
    if (durations.length % 3 !== 0) return false;
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const variance = durations.map((x) => (x - avg) ** 2).reduce((a, b) => a + b, 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const isFlapping = stdDev < FLAPPING_THRESHOLD_MS;
    return isFlapping;
  }
  /**
   * Handles a notice received from the NDK relay.
   * If the notice indicates the relay is complaining (e.g. "too many" or "maximum"),
   * the method disconnects from the relay and attempts to reconnect after a 2-second delay.
   * A debug message is logged with the relay URL and the notice text.
   * The "notice" event is emitted on the ndkRelay instance with the notice text.
   *
   * @param notice - The notice text received from the NDK relay.
   */
  async onNotice(notice) {
    this.ndkRelay.emit("notice", notice);
  }
  /**
   * Attempts to reconnect to the NDK relay after a connection is lost.
   * This function is called recursively to handle multiple reconnection attempts.
   * It checks if the relay is flapping and emits a "flapping" event if so.
   * It then calculates a delay before the next reconnection attempt based on the number of previous attempts.
   * The function sets a timeout to execute the next reconnection attempt after the calculated delay.
   * If the maximum number of reconnection attempts is reached, a debug message is logged.
   *
   * @param attempt - The current attempt number (default is 0).
   */
  handleReconnection(attempt = 0) {
    if (this.reconnectTimeout) return;
    if (this.isFlapping()) {
      this.ndkRelay.emit("flapping", this._connectionStats);
      this._status = 3;
      return;
    }
    let reconnectDelay;
    if (this.wasIdle) {
      const aggressiveDelays = [0, 1e3, 2e3, 5e3, 1e4, 3e4];
      reconnectDelay = aggressiveDelays[Math.min(attempt, aggressiveDelays.length - 1)];
      this.debug(`Using aggressive reconnect after idle, attempt ${attempt}, delay ${reconnectDelay}ms`);
    } else if (this.connectedAt) {
      reconnectDelay = Math.max(0, 6e4 - (Date.now() - this.connectedAt));
    } else {
      reconnectDelay = Math.min(1e3 * 2 ** attempt, 3e4);
      this.debug(`Using standard backoff, attempt ${attempt}, delay ${reconnectDelay}ms`);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = void 0;
      this._status = 2;
      this.connect().catch(() => {
        this.handleReconnection(attempt + 1);
      });
    }, reconnectDelay);
    this.ndkRelay.emit("delayed-connect", reconnectDelay);
    this.debug("Reconnecting in", reconnectDelay);
    this._connectionStats.nextReconnectAt = Date.now() + reconnectDelay;
  }
  /**
   * Sends a message to the NDK relay if the connection is in the CONNECTED state and the WebSocket is open.
   * If the connection is not in the CONNECTED state or the WebSocket is not open, logs a debug message and throws an error.
   *
   * @param message - The message to send to the NDK relay.
   * @throws {Error} If attempting to send on a closed relay connection.
   */
  async send(message) {
    const idleTime = Date.now() - this.lastMessageSent;
    if (idleTime > 12e4) {
      this.wasIdle = true;
    }
    if (this._status >= 5 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws?.send(message);
      this.netDebug?.(message, this.ndkRelay, "send");
      this.lastMessageSent = Date.now();
    } else {
      this.debug(`Not connected to ${this.ndkRelay.url} (%d), not sending message ${message}`, this._status);
      if (this._status >= 5 && this.ws?.readyState !== WebSocket.OPEN) {
        this.debug(`Stale connection detected, WebSocket state: ${this.ws?.readyState}`);
        this.handleStaleConnection();
      }
    }
  }
  /**
   * Authenticates the NDK event by sending it to the NDK relay and returning a promise that resolves with the result.
   *
   * @param event - The NDK event to authenticate.
   * @returns A promise that resolves with the authentication result.
   */
  async auth(event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? [];
      val.push({ resolve, reject });
      this.openEventPublishes.set(event.id, val);
    });
    this.send(`["AUTH",${JSON.stringify(event.rawEvent())}]`);
    return ret;
  }
  /**
   * Clears all pending publish promises by rejecting them with the provided error.
   * This is called on disconnection to prevent memory leaks and ensure promises
   * don't hang indefinitely.
   * @param error The error to reject the promises with
   */
  clearPendingPublishes(error) {
    this.rejectPendingAuthPublishes(error);
    for (const [eventId, resolvers] of this.openEventPublishes.entries()) {
      while (resolvers.length > 0) {
        const resolver = resolvers.shift();
        if (resolver) {
          resolver.reject(error);
        }
      }
      this.openEventPublishes.delete(eventId);
    }
  }
  /**
   * Retries all pending publishes that failed due to auth-required.
   * Called after successful authentication.
   */
  retryPendingAuthPublishes() {
    if (this.pendingAuthPublishes.size === 0) return;
    this.debug(`Retrying ${this.pendingAuthPublishes.size} pending publishes after auth`);
    for (const [eventId, event] of this.pendingAuthPublishes.entries()) {
      this.debug(`Retrying publish for event ${eventId}`);
      this.send(`["EVENT",${JSON.stringify(event)}]`);
    }
    this.pendingAuthPublishes.clear();
  }
  /**
   * Rejects all pending publishes that failed due to auth-required.
   * Called when authentication fails.
   */
  rejectPendingAuthPublishes(error) {
    if (this.pendingAuthPublishes.size === 0) return;
    this.debug(`Rejecting ${this.pendingAuthPublishes.size} pending publishes due to auth failure`);
    for (const [eventId] of this.pendingAuthPublishes.entries()) {
      const ep = this.openEventPublishes.get(eventId);
      if (ep && ep.length > 0) {
        const resolver = ep.pop();
        if (resolver) {
          resolver.reject(new Error(`Authentication failed: ${error.message}`));
        }
        if (ep.length === 0) {
          this.openEventPublishes.delete(eventId);
        }
      }
    }
    this.pendingAuthPublishes.clear();
  }
  /**
   * Publishes an NDK event to the relay and returns a promise that resolves with the result.
   *
   * @param event - The NDK event to publish.
   * @returns A promise that resolves with the result of the event publication.
   * @throws {Error} If attempting to publish on a closed relay connection.
   */
  async publish(event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? [];
      if (val.length > 0) {
        console.warn(`Duplicate event publishing detected, you are publishing event ${event.id} twice`);
      }
      val.push({ resolve, reject });
      this.openEventPublishes.set(event.id, val);
    });
    this.pendingAuthPublishes.set(event.id, event);
    this.send(`["EVENT",${JSON.stringify(event)}]`);
    return ret;
  }
  /**
   * Counts the number of events that match the provided filters.
   *
   * @param filters - The filters to apply to the count request.
   * @param params - An optional object containing a custom id for the count request.
   * @returns A promise that resolves with the count result including optional HLL data.
   * @throws {Error} If attempting to send the count request on a closed relay connection.
   */
  async count(filters, params) {
    this.serial++;
    const id = params?.id || `count:${this.serial}`;
    const ret = new Promise((resolve, reject) => {
      this.openCountRequests.set(id, { resolve, reject });
    });
    this.send(`["COUNT","${id}",${JSON.stringify(filters).substring(1)}`);
    return ret;
  }
  close(subId, reason) {
    this.send(`["CLOSE","${subId}"]`);
    const sub = this.openSubs.get(subId);
    this.openSubs.delete(subId);
    if (sub) sub.onclose(reason);
  }
  /**
   * Subscribes to the NDK relay with the provided filters and parameters.
   *
   * @param filters - The filters to apply to the subscription.
   * @param params - The subscription parameters, including an optional custom id.
   * @returns A new NDKRelaySubscription instance.
   */
  req(relaySub) {
    `${this.send(`["REQ","${relaySub.subId}",${JSON.stringify(relaySub.executeFilters).substring(1)}`)}]`;
    this.openSubs.set(relaySub.subId, relaySub);
  }
  /**
   * Utility functions to update the connection stats.
   */
  updateConnectionStats = {
    connected: () => {
      this._connectionStats.success++;
      this._connectionStats.connectedAt = Date.now();
    },
    disconnected: () => {
      if (this._connectionStats.connectedAt) {
        this._connectionStats.durations.push(Date.now() - this._connectionStats.connectedAt);
        if (this._connectionStats.durations.length > 100) {
          this._connectionStats.durations.shift();
        }
      }
      this._connectionStats.connectedAt = void 0;
    },
    attempt: () => {
      this._connectionStats.attempts++;
      this._connectionStats.connectedAt = Date.now();
    }
  };
  /** Returns the connection stats. */
  get connectionStats() {
    return this._connectionStats;
  }
  /** Returns the relay URL */
  get url() {
    return this.ndkRelay.url;
  }
  get connected() {
    return this._status >= 5 && this.ws?.readyState === WebSocket.OPEN;
  }
};
async function fetchRelayInformation2(relayUrl) {
  const httpUrl = relayUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
  const response = await fetch(httpUrl, {
    headers: {
      Accept: "application/nostr+json"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch relay information: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
var NDKRelayPublisher = class {
  ndkRelay;
  debug;
  constructor(ndkRelay) {
    this.ndkRelay = ndkRelay;
    this.debug = ndkRelay.debug.extend("publisher");
  }
  /**
   * Published an event to the relay; if the relay is not connected, it will
   * wait for the relay to connect before publishing the event.
   *
   * If the relay does not connect within the timeout, the publish operation
   * will fail.
   * @param event  The event to publish
   * @param timeoutMs  The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish(event, timeoutMs = 2500) {
    let timeout;
    const publishConnected = () => {
      return new Promise((resolve, reject) => {
        try {
          this.publishEvent(event).then((_result) => {
            this.ndkRelay.emit("published", event);
            event.emit("relay:published", this.ndkRelay);
            resolve(true);
          }).catch(reject);
        } catch (err) {
          reject(err);
        }
      });
    };
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        timeout = void 0;
        reject(new Error(`Timeout: ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const onConnectHandler = () => {
      publishConnected().then((result) => connectResolve(result)).catch((err) => connectReject(err));
    };
    let connectResolve;
    let connectReject;
    const onError = (err) => {
      this.ndkRelay.debug("Publish failed", err, event.id);
      this.ndkRelay.emit("publish:failed", event, err);
      event.emit("relay:publish:failed", this.ndkRelay, err);
      throw err;
    };
    const onFinally = () => {
      if (timeout) clearTimeout(timeout);
      this.ndkRelay.removeListener("connect", onConnectHandler);
    };
    if (this.ndkRelay.status >= 5) {
      return Promise.race([publishConnected(), timeoutPromise]).catch(onError).finally(onFinally);
    }
    if (this.ndkRelay.status <= 1) {
      console.warn("Relay is disconnected, trying to connect to publish an event", this.ndkRelay.url);
      this.ndkRelay.connect();
    } else {
      console.warn("Relay not connected, waiting for connection to publish an event", this.ndkRelay.url);
    }
    return Promise.race([
      new Promise((resolve, reject) => {
        connectResolve = resolve;
        connectReject = reject;
        this.ndkRelay.on("connect", onConnectHandler);
      }),
      timeoutPromise
    ]).catch(onError).finally(onFinally);
  }
  async publishEvent(event) {
    return this.ndkRelay.connectivity.publish(event.rawEvent());
  }
};
var SignatureVerificationStats = class {
  ndk;
  debug;
  intervalId = null;
  intervalMs;
  /**
   * Creates a new SignatureVerificationStats instance
   *
   * @param ndk - The NDK instance to track stats for
   * @param intervalMs - How often to print stats (in milliseconds)
   */
  constructor(ndk, intervalMs = 1e4) {
    this.ndk = ndk;
    this.debug = (0, import_debug3.default)("ndk:signature-verification-stats");
    this.intervalMs = intervalMs;
  }
  /**
   * Start tracking and reporting signature verification statistics
   */
  start() {
    if (this.intervalId) {
      this.debug("Stats tracking already started");
      return;
    }
    this.debug(`Starting signature verification stats reporting every ${this.intervalMs}ms`);
    this.intervalId = setInterval(() => {
      this.reportStats();
    }, this.intervalMs);
  }
  /**
   * Stop tracking and reporting signature verification statistics
   */
  stop() {
    if (!this.intervalId) {
      this.debug("Stats tracking not started");
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.debug("Stopped signature verification stats reporting");
  }
  /**
   * Report current signature verification statistics for all relays
   */
  reportStats() {
    const stats = this.collectStats();
    console.log("\n=== Signature Verification Sampling Stats ===");
    console.log(`Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    console.log(`Total Relays: ${stats.totalRelays}`);
    console.log(`Connected Relays: ${stats.connectedRelays}`);
    if (stats.relayStats.length === 0) {
      console.log("No relay statistics available");
    } else {
      console.log("\nRelay Statistics:");
      stats.relayStats.sort((a, b) => a.url.localeCompare(b.url));
      stats.relayStats.forEach((relayStat) => {
        console.log(`
  ${relayStat.url} ${relayStat.connected ? "(connected)" : "(disconnected)"}`);
        console.log(`    Validated Events: ${relayStat.validatedCount}`);
        console.log(`    Non-validated Events: ${relayStat.nonValidatedCount}`);
        console.log(`    Total Events: ${relayStat.totalEvents}`);
        console.log(
          `    Current Validation Ratio: ${relayStat.validationRatio.toFixed(4)} (${(relayStat.validationRatio * 100).toFixed(2)}%)`
        );
        console.log(
          `    Target Validation Ratio: ${relayStat.targetValidationRatio?.toFixed(4) || "N/A"} (${relayStat.targetValidationRatio ? (relayStat.targetValidationRatio * 100).toFixed(2) + "%" : "N/A"})`
        );
        console.log(`    Trusted: ${relayStat.trusted ? "Yes" : "No"}`);
      });
    }
    console.log("\nGlobal Settings:");
    console.log(
      `  Initial Validation Ratio: ${stats.initialValidationRatio.toFixed(4)} (${(stats.initialValidationRatio * 100).toFixed(2)}%)`
    );
    console.log(
      `  Lowest Validation Ratio: ${stats.lowestValidationRatio.toFixed(4)} (${(stats.lowestValidationRatio * 100).toFixed(2)}%)`
    );
    console.log("===========================================\n");
  }
  /**
   * Collect statistics from all relays
   */
  collectStats() {
    const relayStats = [];
    for (const relay of this.ndk.pool.relays.values()) {
      relayStats.push({
        url: relay.url,
        connected: relay.connected,
        validatedCount: relay.validatedEventCount,
        nonValidatedCount: relay.nonValidatedEventCount,
        totalEvents: relay.validatedEventCount + relay.nonValidatedEventCount,
        validationRatio: relay.validationRatio,
        targetValidationRatio: relay.targetValidationRatio,
        trusted: relay.trusted
      });
    }
    return {
      totalRelays: this.ndk.pool.relays.size,
      connectedRelays: this.ndk.pool.connectedRelays().length,
      relayStats,
      initialValidationRatio: this.ndk.initialValidationRatio,
      lowestValidationRatio: this.ndk.lowestValidationRatio
    };
  }
};
function startSignatureVerificationStats(ndk, intervalMs = 1e4) {
  const stats = new SignatureVerificationStats(ndk, intervalMs);
  stats.start();
  return stats;
}
function filterFingerprint(filters, closeOnEose) {
  const elements = [];
  for (const filter of filters) {
    const keys = Object.entries(filter || {}).map(([key, values]) => {
      if (["since", "until"].includes(key)) {
        return `${key}:${values}`;
      }
      return key;
    }).sort().join("-");
    elements.push(keys);
  }
  let id = closeOnEose ? "+" : "";
  id += elements.join("|");
  return id;
}
function mergeFilters(filters) {
  const result = [];
  const lastResult = {};
  filters.filter((f) => !!f.limit).forEach((filterWithLimit) => result.push(filterWithLimit));
  filters = filters.filter((f) => !f.limit);
  if (filters.length === 0) return result;
  filters.forEach((filter) => {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (lastResult[key] === void 0) {
          lastResult[key] = [...value];
        } else {
          lastResult[key] = Array.from(/* @__PURE__ */ new Set([...lastResult[key], ...value]));
        }
      } else {
        lastResult[key] = value;
      }
    });
  });
  return [...result, lastResult];
}
var MAX_ITEMS = 3;
function formatArray(items, formatter) {
  const formatted = formatter ? items.slice(0, MAX_ITEMS).map(formatter) : items.slice(0, MAX_ITEMS);
  const display = formatted.join(",");
  return items.length > MAX_ITEMS ? `${display}+${items.length - MAX_ITEMS}` : display;
}
function formatFilters(filters) {
  return filters.map((f) => {
    const parts = [];
    if (f.ids?.length) {
      parts.push(`ids:[${formatArray(f.ids, (id) => String(id).slice(0, 8))}]`);
    }
    if (f.kinds?.length) {
      parts.push(`kinds:[${formatArray(f.kinds)}]`);
    }
    if (f.authors?.length) {
      parts.push(`authors:[${formatArray(f.authors, (a) => String(a).slice(0, 8))}]`);
    }
    if (f.since) {
      parts.push(`since:${f.since}`);
    }
    if (f.until) {
      parts.push(`until:${f.until}`);
    }
    if (f.limit) {
      parts.push(`limit:${f.limit}`);
    }
    if (f.search) {
      parts.push(`search:"${String(f.search).slice(0, 20)}"`);
    }
    for (const [key, value] of Object.entries(f)) {
      if (key.startsWith("#") && Array.isArray(value) && value.length > 0) {
        parts.push(`${key}:[${formatArray(value, (v) => String(v).slice(0, 8))}]`);
      }
    }
    return `{${parts.join(" ")}}`;
  }).join(", ");
}
var NDKRelaySubscription = class {
  fingerprint;
  items = /* @__PURE__ */ new Map();
  topSubManager;
  debug;
  /**
   * Tracks the status of this REQ.
   */
  status = 0;
  onClose;
  relay;
  /**
   * Whether this subscription has reached EOSE.
   */
  eosed = false;
  /**
   * Timeout at which this subscription will
   * start executing.
   */
  executionTimer;
  /**
   * Track the time at which this subscription will fire.
   */
  fireTime;
  /**
   * The delay type that the current fireTime was calculated with.
   */
  delayType;
  /**
   * The filters that have been executed.
   */
  executeFilters;
  id = Math.random().toString(36).substring(7);
  /**
   *
   * @param fingerprint The fingerprint of this subscription.
   */
  constructor(relay, fingerprint, topSubManager) {
    this.relay = relay;
    this.topSubManager = topSubManager;
    this.debug = relay.debug.extend(`sub[${this.id}]`);
    this.fingerprint = fingerprint || Math.random().toString(36).substring(7);
  }
  _subId;
  get subId() {
    if (this._subId) return this._subId;
    this._subId = this.fingerprint.slice(0, 15);
    return this._subId;
  }
  subIdParts = /* @__PURE__ */ new Set();
  addSubIdPart(part) {
    this.subIdParts.add(part);
  }
  addItem(subscription, filters) {
    if (this.items.has(subscription.internalId)) {
      return;
    }
    subscription.on("close", this.removeItem.bind(this, subscription));
    this.items.set(subscription.internalId, { subscription, filters });
    if (this.status !== 3) {
      if (subscription.subId && (!this._subId || this._subId.length < 25)) {
        if (this.status === 0 || this.status === 1) {
          this.addSubIdPart(subscription.subId);
        }
      }
    }
    switch (this.status) {
      case 0:
        this.evaluateExecutionPlan(subscription);
        break;
      case 3:
        break;
      case 1:
        this.evaluateExecutionPlan(subscription);
        break;
      case 4:
        this.debug("Subscription is closed, cannot add new items", {
          filters: formatFilters(filters),
          subId: subscription.subId,
          internalId: subscription.internalId
        });
        throw new Error("Cannot add new items to a closed subscription");
    }
  }
  /**
   * A subscription has been closed, remove it from the list of items.
   * @param subscription
   */
  removeItem(subscription) {
    this.items.delete(subscription.internalId);
    if (this.items.size === 0) {
      if (this.status === 0 || this.status === 1) {
        this.status = 4;
        this.cleanup();
        return;
      }
      if (!this.eosed) return;
      this.close();
      this.cleanup();
    }
  }
  close() {
    if (this.status === 4) return;
    const prevStatus = this.status;
    this.status = 4;
    if (prevStatus === 3) {
      try {
        this.relay.close(this.subId);
      } catch (e) {
        this.debug("Error closing subscription", e, this);
      }
    } else {
      this.debug("Subscription wanted to close but it wasn't running, this is probably ok", {
        subId: this.subId,
        prevStatus,
        sub: this
      });
    }
    this.cleanup();
  }
  cleanup() {
    if (this.executionTimer) clearTimeout(this.executionTimer);
    this.relay.off("ready", this.executeOnRelayReady);
    this.relay.off("authed", this.reExecuteAfterAuth);
    if (this.onClose) this.onClose(this);
  }
  evaluateExecutionPlan(subscription) {
    if (!subscription.isGroupable()) {
      this.status = 1;
      this.execute();
      return;
    }
    if (subscription.filters.find((filter) => !!filter.limit)) {
      this.executeFilters = this.compileFilters();
      if (this.executeFilters.length >= 10) {
        this.status = 1;
        this.execute();
        return;
      }
    }
    const delay = subscription.groupableDelay;
    const delayType = subscription.groupableDelayType;
    if (!delay) throw new Error("Cannot group a subscription without a delay");
    if (this.status === 0) {
      this.schedule(delay, delayType);
    } else {
      const existingDelayType = this.delayType;
      const timeUntilFire = this.fireTime - Date.now();
      if (existingDelayType === "at-least" && delayType === "at-least") {
        if (timeUntilFire < delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-least" && delayType === "at-most") {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-most" && delayType === "at-most") {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-most" && delayType === "at-least") {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else {
        throw new Error(`Unknown delay type combination ${existingDelayType} ${delayType}`);
      }
    }
  }
  schedule(delay, delayType) {
    this.status = 1;
    const currentTime = Date.now();
    this.fireTime = currentTime + delay;
    this.delayType = delayType;
    const timer = setTimeout(() => {
      this.execute();
    }, delay);
    if (delayType === "at-least") {
      this.executionTimer = timer;
    }
  }
  executeOnRelayReady = () => {
    if (this.status !== 2) return;
    if (this.items.size === 0) {
      this.debug(
        "No items to execute; this relay was probably too slow to respond and the caller gave up",
        {
          status: this.status,
          fingerprint: this.fingerprint,
          id: this.id,
          subId: this.subId
        }
      );
      this.cleanup();
      return;
    }
    this.debug("Executing on relay ready", {
      status: this.status,
      fingerprint: this.fingerprint,
      itemsSize: this.items.size,
      filters: formatFilters(this.compileFilters())
    });
    this.status = 1;
    this.execute();
  };
  finalizeSubId() {
    if (this.subIdParts.size > 0) {
      const parts = Array.from(this.subIdParts).map((part) => part.substring(0, 10));
      let joined = parts.join("-");
      if (joined.length > 20) {
        joined = joined.substring(0, 20);
      }
      this._subId = joined;
    } else {
      this._subId = this.fingerprint.slice(0, 15);
    }
    this._subId += `-${Math.random().toString(36).substring(2, 7)}`;
  }
  // we do it this way so that we can remove the listener
  reExecuteAfterAuth = (() => {
    const oldSubId = this.subId;
    this.debug("Re-executing after auth", this.items.size);
    if (this.eosed) {
      this.relay.close(this.subId);
    } else {
      this.debug(
        "We are abandoning an opened subscription, once it EOSE's, the handler will close it",
        {
          oldSubId
        }
      );
    }
    this._subId = void 0;
    this.status = 1;
    this.execute();
    this.debug("Re-executed after auth %s \u{1F449} %s", oldSubId, this.subId);
  }).bind(this);
  execute() {
    if (this.status !== 1) {
      return;
    }
    if (!this.relay.connected) {
      this.status = 2;
      this.debug("Waiting for relay to be ready", {
        status: this.status,
        id: this.subId,
        fingerprint: this.fingerprint,
        itemsSize: this.items.size
      });
      this.relay.once("ready", this.executeOnRelayReady);
      return;
    }
    if (this.relay.status < 8) {
      this.relay.once("authed", this.reExecuteAfterAuth);
    }
    this.status = 3;
    this.finalizeSubId();
    this.executeFilters = this.compileFilters();
    this.relay.req(this);
  }
  onstart() {
  }
  onevent(event) {
    this.topSubManager.dispatchEvent(event, this.relay);
  }
  oneose(subId) {
    this.eosed = true;
    if (subId !== this.subId) {
      this.debug("Received EOSE for an abandoned subscription", subId, this.subId);
      this.relay.close(subId);
      return;
    }
    if (this.items.size === 0) {
      this.close();
    }
    for (const { subscription } of this.items.values()) {
      subscription.eoseReceived(this.relay);
      if (subscription.closeOnEose) {
        this.removeItem(subscription);
      }
    }
  }
  onclose(_reason) {
    this.status = 4;
  }
  onclosed(reason) {
    if (!reason) return;
    for (const { subscription } of this.items.values()) {
      subscription.closedReceived(this.relay, reason);
    }
  }
  /**
   * Grabs the filters from all the subscriptions
   * and merges them into a single filter.
   */
  compileFilters() {
    const mergedFilters = [];
    const filters = Array.from(this.items.values()).map((item) => item.filters);
    if (!filters[0]) {
      this.debug("\u{1F440} No filters to merge", { itemsSize: this.items.size });
      return [];
    }
    const filterCount = filters[0].length;
    for (let i2 = 0; i2 < filterCount; i2++) {
      const allFiltersAtIndex = filters.map((filter) => filter[i2]);
      const merged = mergeFilters(allFiltersAtIndex);
      mergedFilters.push(...merged);
    }
    return mergedFilters;
  }
};
var NDKRelaySubscriptionManager = class {
  relay;
  subscriptions;
  generalSubManager;
  /**
   * @param relay - The relay instance.
   * @param generalSubManager - The subscription manager instance.
   */
  constructor(relay, generalSubManager) {
    this.relay = relay;
    this.subscriptions = /* @__PURE__ */ new Map();
    this.generalSubManager = generalSubManager;
  }
  /**
   * Adds a subscription to the manager.
   */
  addSubscription(sub, filters) {
    let relaySub;
    if (!sub.isGroupable()) {
      relaySub = this.createSubscription(sub, filters);
    } else {
      const filterFp = filterFingerprint(filters, sub.closeOnEose);
      if (filterFp) {
        const existingSubs = this.subscriptions.get(filterFp);
        relaySub = (existingSubs || []).find(
          (sub2) => sub2.status < 3
          /* RUNNING */
        );
      }
      relaySub ??= this.createSubscription(sub, filters, filterFp);
    }
    relaySub.addItem(sub, filters);
  }
  createSubscription(_sub, _filters, fingerprint) {
    const relaySub = new NDKRelaySubscription(this.relay, fingerprint || null, this.generalSubManager);
    relaySub.onClose = this.onRelaySubscriptionClose.bind(this);
    const currentVal = this.subscriptions.get(relaySub.fingerprint) ?? [];
    this.subscriptions.set(relaySub.fingerprint, [...currentVal, relaySub]);
    return relaySub;
  }
  onRelaySubscriptionClose(sub) {
    let currentVal = this.subscriptions.get(sub.fingerprint) ?? [];
    if (!currentVal) {
      console.warn("Unexpectedly did not find a subscription with fingerprint", sub.fingerprint);
    } else if (currentVal.length === 1) {
      this.subscriptions.delete(sub.fingerprint);
    } else {
      currentVal = currentVal.filter((s) => s.id !== sub.id);
      this.subscriptions.set(sub.fingerprint, currentVal);
    }
  }
};
var NDKRelayStatus = /* @__PURE__ */ ((NDKRelayStatus2) => {
  NDKRelayStatus2[NDKRelayStatus2["DISCONNECTING"] = 0] = "DISCONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["DISCONNECTED"] = 1] = "DISCONNECTED";
  NDKRelayStatus2[NDKRelayStatus2["RECONNECTING"] = 2] = "RECONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["FLAPPING"] = 3] = "FLAPPING";
  NDKRelayStatus2[NDKRelayStatus2["CONNECTING"] = 4] = "CONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["CONNECTED"] = 5] = "CONNECTED";
  NDKRelayStatus2[NDKRelayStatus2["AUTH_REQUESTED"] = 6] = "AUTH_REQUESTED";
  NDKRelayStatus2[NDKRelayStatus2["AUTHENTICATING"] = 7] = "AUTHENTICATING";
  NDKRelayStatus2[NDKRelayStatus2["AUTHENTICATED"] = 8] = "AUTHENTICATED";
  return NDKRelayStatus2;
})(NDKRelayStatus || {});
var NDKRelay = class _NDKRelay extends import_tseep2.EventEmitter {
  url;
  scores;
  connectivity;
  subs;
  publisher;
  authPolicy;
  /**
   * Protocol handlers for custom relay message types (e.g., NEG-OPEN, NEG-MSG).
   * Allows external packages to handle non-standard relay messages.
   */
  protocolHandlers = /* @__PURE__ */ new Map();
  /**
   * Cached relay information from NIP-11.
   */
  _relayInfo;
  /**
   * The lowest validation ratio this relay can reach.
   */
  lowestValidationRatio;
  /**
   * Current validation ratio this relay is targeting.
   */
  targetValidationRatio;
  validationRatioFn;
  /**
   * This tracks events that have been seen by this relay
   * with a valid signature.
   */
  validatedEventCount = 0;
  /**
   * This tracks events that have been seen by this relay
   * but have not been validated.
   */
  nonValidatedEventCount = 0;
  /**
   * Whether this relay is trusted.
   *
   * Trusted relay's events do not get their signature verified.
   */
  trusted = false;
  complaining = false;
  debug;
  static defaultValidationRatioUpdateFn = (relay, validatedCount, _nonValidatedCount) => {
    if (relay.lowestValidationRatio === void 0 || relay.targetValidationRatio === void 0) return 1;
    let newRatio = relay.validationRatio;
    if (relay.validationRatio > relay.targetValidationRatio) {
      const factor = validatedCount / 100;
      newRatio = Math.max(relay.lowestValidationRatio, relay.validationRatio - factor);
    }
    if (newRatio < relay.validationRatio) {
      return newRatio;
    }
    return relay.validationRatio;
  };
  constructor(url, authPolicy, ndk) {
    super();
    this.url = normalizeRelayUrl(url);
    this.scores = /* @__PURE__ */ new Map();
    this.debug = (0, import_debug2.default)(`ndk:relay:${url}`);
    this.connectivity = new NDKRelayConnectivity(this, ndk);
    this.connectivity.netDebug = ndk?.netDebug;
    this.req = this.connectivity.req.bind(this.connectivity);
    this.close = this.connectivity.close.bind(this.connectivity);
    this.subs = new NDKRelaySubscriptionManager(this, ndk.subManager);
    this.publisher = new NDKRelayPublisher(this);
    this.authPolicy = authPolicy;
    this.targetValidationRatio = ndk?.initialValidationRatio;
    this.lowestValidationRatio = ndk?.lowestValidationRatio;
    this.validationRatioFn = (ndk?.validationRatioFn ?? _NDKRelay.defaultValidationRatioUpdateFn).bind(this);
    this.updateValidationRatio();
    if (!ndk) {
      console.trace("relay created without ndk");
    }
  }
  updateValidationRatio() {
    if (this.validationRatioFn && this.validatedEventCount > 0) {
      const newRatio = this.validationRatioFn(this, this.validatedEventCount, this.nonValidatedEventCount);
      this.targetValidationRatio = newRatio;
    }
    setTimeout(() => {
      this.updateValidationRatio();
    }, 3e4);
  }
  get status() {
    return this.connectivity.status;
  }
  get connectionStats() {
    return this.connectivity.connectionStats;
  }
  /**
   * Connects to the relay.
   */
  async connect(timeoutMs, reconnect = true) {
    return this.connectivity.connect(timeoutMs, reconnect);
  }
  /**
   * Disconnects from the relay.
   */
  disconnect() {
    if (this.status === 1) {
      return;
    }
    this.connectivity.disconnect();
  }
  /**
   * Queues or executes the subscription of a specific set of filters
   * within this relay.
   *
   * @param subscription NDKSubscription this filters belong to.
   * @param filters Filters to execute
   */
  subscribe(subscription, filters) {
    this.subs.addSubscription(subscription, filters);
  }
  /**
   * Publishes an event to the relay with an optional timeout.
   *
   * If the relay is not connected, the event will be published when the relay connects,
   * unless the timeout is reached before the relay connects.
   *
   * @param event The event to publish
   * @param timeoutMs The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish(event, timeoutMs = 2500) {
    return this.publisher.publish(event, timeoutMs);
  }
  referenceTags() {
    return [["r", this.url]];
  }
  addValidatedEvent() {
    this.validatedEventCount++;
  }
  addNonValidatedEvent() {
    this.nonValidatedEventCount++;
  }
  /**
   * The current validation ratio this relay has achieved.
   */
  get validationRatio() {
    if (this.nonValidatedEventCount === 0) {
      return 1;
    }
    return this.validatedEventCount / (this.validatedEventCount + this.nonValidatedEventCount);
  }
  shouldValidateEvent() {
    if (this.trusted) {
      return false;
    }
    if (this.targetValidationRatio === void 0) {
      return true;
    }
    if (this.targetValidationRatio >= 1) return true;
    return Math.random() < this.targetValidationRatio;
  }
  get connected() {
    return this.connectivity.connected;
  }
  req;
  close;
  /**
   * Registers a protocol handler for a specific message type.
   * This allows external packages to handle custom relay messages (e.g., NIP-77 NEG-* messages).
   *
   * @param messageType The message type to handle (e.g., "NEG-OPEN", "NEG-MSG")
   * @param handler The function to call when a message of this type is received
   *
   * @example
   * ```typescript
   * relay.registerProtocolHandler('NEG-MSG', (relay, message) => {
   *   console.log('Received NEG-MSG:', message);
   * });
   * ```
   */
  registerProtocolHandler(messageType, handler) {
    this.protocolHandlers.set(messageType, handler);
  }
  /**
   * Unregisters a protocol handler for a specific message type.
   *
   * @param messageType The message type to stop handling
   */
  unregisterProtocolHandler(messageType) {
    this.protocolHandlers.delete(messageType);
  }
  /**
   * Checks if a protocol handler is registered for a message type.
   * This is used internally by the connectivity layer to route messages.
   *
   * @internal
   * @param messageType The message type to check
   * @returns The handler function if registered, undefined otherwise
   */
  getProtocolHandler(messageType) {
    return this.protocolHandlers.get(messageType);
  }
  /**
   * Fetches relay information (NIP-11) from the relay.
   * Results are cached in persistent storage when cache adapter is available (24-hour TTL).
   * Falls back to in-memory cache. Pass force=true to bypass all caches.
   *
   * @param force Force a fresh fetch, bypassing all caches
   * @returns The relay information document
   * @throws Error if the fetch fails
   *
   * @example
   * ```typescript
   * const info = await relay.fetchInfo();
   * console.log(`Relay: ${info.name}`);
   * console.log(`Supported NIPs: ${info.supported_nips?.join(', ')}`);
   * ```
   */
  async fetchInfo(force = false) {
    const MAX_AGE = 864e5;
    const ndk = this.connectivity.ndk;
    if (!force && ndk?.cacheAdapter?.getRelayStatus) {
      const cached = await ndk.cacheAdapter.getRelayStatus(this.url);
      if (cached?.nip11 && Date.now() - cached.nip11.fetchedAt < MAX_AGE) {
        this._relayInfo = cached.nip11.data;
        return cached.nip11.data;
      }
    }
    if (!force && this._relayInfo) {
      return this._relayInfo;
    }
    this._relayInfo = await fetchRelayInformation2(this.url);
    if (ndk?.cacheAdapter?.updateRelayStatus) {
      await ndk.cacheAdapter.updateRelayStatus(this.url, {
        nip11: {
          data: this._relayInfo,
          fetchedAt: Date.now()
        }
      });
    }
    return this._relayInfo;
  }
  /**
   * Returns cached relay information if available, undefined otherwise.
   * Use fetchInfo() to retrieve fresh information.
   */
  get info() {
    return this._relayInfo;
  }
};
var NDKPublishError = class extends Error {
  errors;
  publishedToRelays;
  /**
   * Intended relay set where the publishing was intended to happen.
   */
  intendedRelaySet;
  constructor(message, errors, publishedToRelays, intendedRelaySet) {
    super(message);
    this.errors = errors;
    this.publishedToRelays = publishedToRelays;
    this.intendedRelaySet = intendedRelaySet;
  }
  get relayErrors() {
    const errors = [];
    for (const [relay, err] of this.errors) {
      errors.push(`${relay.url}: ${err}`);
    }
    return errors.join("\n");
  }
};
var NDKRelaySet = class _NDKRelaySet {
  relays;
  debug;
  ndk;
  pool;
  constructor(relays, ndk, pool) {
    this.relays = relays;
    this.ndk = ndk;
    this.pool = pool ?? ndk.pool;
    this.debug = ndk.debug.extend("relayset");
  }
  /**
   * Adds a relay to this set.
   */
  addRelay(relay) {
    this.relays.add(relay);
  }
  get relayUrls() {
    return Array.from(this.relays).map((r) => r.url);
  }
  /**
   * Creates a relay set from a list of relay URLs.
   *
   * If no connection to the relay is found in the pool it will temporarily
   * connect to it.
   *
   * @param relayUrls - list of relay URLs to include in this set
   * @param ndk
   * @param connect - whether to connect to the relay immediately if it was already in the pool but not connected
   * @returns NDKRelaySet
   */
  static fromRelayUrls(relayUrls, ndk, connect = true, pool) {
    pool = pool ?? ndk.pool;
    if (!pool) throw new Error("No pool provided");
    const relays = /* @__PURE__ */ new Set();
    for (const url of relayUrls) {
      const relay = pool.relays.get(normalizeRelayUrl(url));
      if (relay) {
        if (relay.status < 5 && connect) {
          relay.connect();
        }
        relays.add(relay);
      } else {
        const temporaryRelay = new NDKRelay(normalizeRelayUrl(url), ndk?.relayAuthDefaultPolicy, ndk);
        pool.useTemporaryRelay(temporaryRelay, void 0, `requested from fromRelayUrls ${relayUrls}`);
        relays.add(temporaryRelay);
      }
    }
    return new _NDKRelaySet(new Set(relays), ndk, pool);
  }
  /**
   * Publish an event to all relays in this relay set.
   *
   * This method implements a robust mechanism for publishing events to multiple relays with
   * built-in handling for race conditions, timeouts, and partial failures. The implementation
   * uses a dual-tracking mechanism to ensure accurate reporting of which relays successfully
   * received an event.
   *
   * Key aspects of this implementation:
   *
   * 1. DUAL-TRACKING MECHANISM:
   *    - Promise-based tracking: Records successes/failures from the promises returned by relay.publish()
   *    - Event-based tracking: Listens for 'relay:published' events that indicate successful publishing
   *    This approach ensures we don't miss successful publishes even if there are subsequent errors in
   *    the promise chain.
   *
   * 2. RACE CONDITION HANDLING:
   *    - If a relay emits a success event but later fails in the promise chain, we still count it as a success
   *    - If a relay times out after successfully publishing, we still count it as a success
   *    - All relay operations happen in parallel, with proper tracking regardless of completion order
   *
   * 3. TIMEOUT MANAGEMENT:
   *    - Individual timeouts for each relay operation
   *    - Proper cleanup of timeouts to prevent memory leaks
   *    - Clear timeout error reporting
   *
   * 4. ERROR HANDLING:
   *    - Detailed tracking of specific errors for each failed relay
   *    - Special handling for ephemeral events (which don't expect acknowledgement)
   *    - RequiredRelayCount parameter to control the minimum success threshold
   *
   * @param event Event to publish
   * @param timeoutMs Timeout in milliseconds for each relay publish operation
   * @param requiredRelayCount The minimum number of relays we expect the event to be published to
   * @returns A set of relays the event was published to
   * @throws {NDKPublishError} If the event could not be published to at least `requiredRelayCount` relays
   * @example
   * ```typescript
   * const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
   * const publishedToRelays = await relaySet.publish(event);
   * // publishedToRelays can contain relay1, relay2, both, or none
   * // depending on which relays the event was successfully published to
   * if (publishedToRelays.size > 0) {
   *   console.log("Event published to at least one relay");
   * }
   * ```
   */
  async publish(event, timeoutMs, requiredRelayCount = 1) {
    const publishedToRelays = /* @__PURE__ */ new Set();
    const errors = /* @__PURE__ */ new Map();
    const isEphemeral2 = event.isEphemeral();
    event.publishStatus = "pending";
    const relayPublishedHandler = (relay) => {
      publishedToRelays.add(relay);
    };
    event.on("relay:published", relayPublishedHandler);
    try {
      const promises = Array.from(this.relays).map((relay) => {
        return new Promise((resolve) => {
          const timeoutId = timeoutMs ? setTimeout(() => {
            if (!publishedToRelays.has(relay)) {
              errors.set(relay, new Error(`Publish timeout after ${timeoutMs}ms`));
              resolve(false);
            }
          }, timeoutMs) : null;
          relay.publish(event, timeoutMs).then((success) => {
            if (timeoutId) clearTimeout(timeoutId);
            if (success) {
              publishedToRelays.add(relay);
              resolve(true);
            } else {
              resolve(false);
            }
          }).catch((err) => {
            if (timeoutId) clearTimeout(timeoutId);
            if (!isEphemeral2) {
              errors.set(relay, err);
            }
            resolve(false);
          });
        });
      });
      await Promise.all(promises);
      if (publishedToRelays.size < requiredRelayCount) {
        if (!isEphemeral2) {
          const error = new NDKPublishError(
            "Not enough relays received the event (" + publishedToRelays.size + " published, " + requiredRelayCount + " required)",
            errors,
            publishedToRelays,
            this
          );
          event.publishStatus = "error";
          event.publishError = error;
          this.ndk?.emit("event:publish-failed", event, error, this.relayUrls);
          throw error;
        }
      } else {
        event.publishStatus = "success";
        event.emit("published", { relaySet: this, publishedToRelays });
      }
      return publishedToRelays;
    } finally {
      event.off("relay:published", relayPublishedHandler);
    }
  }
  get size() {
    return this.relays.size;
  }
  /**
   * Counts events matching the given filters across all relays in this set.
   *
   * This method implements NIP-45 COUNT with HyperLogLog (HLL) support for
   * accurate cardinality estimation across multiple relays.
   *
   * When relays return HLL data, the counts are merged using the HLL algorithm
   * to avoid double-counting events that appear on multiple relays.
   *
   * @param filters - The filters to count events for
   * @param opts - Optional count options (timeout, custom id)
   * @returns An aggregated count result with the best estimate and per-relay results
   *
   * @example
   * ```typescript
   * const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
   * const result = await relaySet.count([{ kinds: [1], authors: [pubkey] }]);
   * console.log(`Estimated unique count: ${result.count}`);
   * console.log(`Relay 1 reported: ${result.relayResults.get(relay1.url)?.count}`);
   * ```
   */
  async count(filters, opts = {}) {
    const timeout = opts.timeout ?? 5e3;
    const filtersArray = Array.isArray(filters) ? filters : [filters];
    const relayResults = /* @__PURE__ */ new Map();
    const hlls = [];
    const promises = Array.from(this.relays).map(async (relay) => {
      if (relay.status < 5) {
        return;
      }
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Count timeout after ${timeout}ms`)), timeout);
        });
        const result = await Promise.race([
          relay.connectivity.count(filtersArray, { id: opts.id }),
          timeoutPromise
        ]);
        relayResults.set(relay.url, result);
        if (result.hll) {
          hlls.push(result.hll);
        }
      } catch (error) {
        this.debug(`Count failed for relay ${relay.url}:`, error);
      }
    });
    await Promise.allSettled(promises);
    let count;
    let mergedHll;
    if (hlls.length > 0) {
      mergedHll = NDKCountHll.merge(hlls);
      count = mergedHll.estimate();
    } else {
      count = 0;
      for (const result of relayResults.values()) {
        count = Math.max(count, result.count);
      }
    }
    return {
      count,
      mergedHll,
      relayResults
    };
  }
};
var d = (0, import_debug.default)("ndk:outbox:calculate");
async function calculateRelaySetFromEvent(ndk, event, requiredRelayCount) {
  const relays = /* @__PURE__ */ new Set();
  const authorWriteRelays = await getWriteRelaysFor(ndk, event.pubkey);
  if (authorWriteRelays) {
    authorWriteRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl);
      if (relay) relays.add(relay);
    });
  }
  let relayHints = event.tags.filter((tag) => ["a", "e"].includes(tag[0])).map((tag) => tag[2]).filter((url) => url?.startsWith("wss://")).filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }).map((url) => normalizeRelayUrl(url));
  relayHints = Array.from(new Set(relayHints)).slice(0, 5);
  relayHints.forEach((relayUrl) => {
    const relay = ndk.pool?.getRelay(relayUrl, true, true);
    if (relay) {
      d("Adding relay hint %s", relayUrl);
      relays.add(relay);
    }
  });
  const pTags = event.getMatchingTags("p").map((tag) => tag[1]);
  if (pTags.length < 5) {
    const pTaggedRelays = Array.from(
      chooseRelayCombinationForPubkeys(ndk, pTags, "read", {
        preferredRelays: new Set(authorWriteRelays)
      }).keys()
    );
    pTaggedRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl, false, true);
      if (relay) {
        d("Adding p-tagged relay %s", relayUrl);
        relays.add(relay);
      }
    });
  } else {
    d("Too many p-tags to consider %d", pTags.length);
  }
  ndk.pool?.permanentAndConnectedRelays().forEach((relay) => relays.add(relay));
  if (requiredRelayCount && relays.size < requiredRelayCount) {
    const explicitRelays = ndk.explicitRelayUrls?.filter((url) => !Array.from(relays).some((r) => r.url === url)).slice(0, requiredRelayCount - relays.size);
    explicitRelays?.forEach((url) => {
      const relay = ndk.pool?.getRelay(url, false, true);
      if (relay) {
        d("Adding explicit relay %s", url);
        relays.add(relay);
      }
    });
  }
  return new NDKRelaySet(relays, ndk);
}
function calculateRelaySetsFromFilter(ndk, filters, pool, relayGoalPerAuthor) {
  const result = /* @__PURE__ */ new Map();
  const authors = /* @__PURE__ */ new Set();
  filters.forEach((filter) => {
    if (filter.authors) {
      filter.authors.forEach((author) => authors.add(author));
    }
  });
  if (authors.size > 0) {
    const authorToRelaysMap = getRelaysForFilterWithAuthors(ndk, Array.from(authors), relayGoalPerAuthor);
    for (const relayUrl of authorToRelaysMap.keys()) {
      result.set(relayUrl, []);
    }
    for (const filter of filters) {
      if (filter.authors) {
        for (const [relayUrl, authors2] of authorToRelaysMap.entries()) {
          const authorFilterAndRelayPubkeyIntersection = filter.authors.filter(
            (author) => authors2.includes(author)
          );
          result.set(relayUrl, [
            ...result.get(relayUrl),
            {
              ...filter,
              // Overwrite authors sent to this relay with the authors that were
              // present in the filter and are also present in the relay
              authors: authorFilterAndRelayPubkeyIntersection
            }
          ]);
        }
      } else {
        for (const relayUrl of authorToRelaysMap.keys()) {
          result.set(relayUrl, [...result.get(relayUrl), filter]);
        }
      }
    }
  } else {
    if (ndk.explicitRelayUrls) {
      ndk.explicitRelayUrls.forEach((relayUrl) => {
        result.set(relayUrl, filters);
      });
    }
  }
  if (result.size === 0) {
    pool.permanentAndConnectedRelays().slice(0, 5).forEach((relay) => {
      result.set(relay.url, filters);
    });
  }
  return result;
}
function calculateRelaySetsFromFilters(ndk, filters, pool, relayGoalPerAuthor) {
  const a = calculateRelaySetsFromFilter(ndk, filters, pool, relayGoalPerAuthor);
  return a;
}
function isValidHex64(value) {
  if (typeof value !== "string" || value.length !== 64) {
    return false;
  }
  for (let i2 = 0; i2 < 64; i2++) {
    const c = value.charCodeAt(i2);
    if (!(c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70)) {
      return false;
    }
  }
  return true;
}
function isValidPubkey(pubkey) {
  return isValidHex64(pubkey);
}
function isValidEventId(id) {
  return isValidHex64(id);
}
function isValidNip05(input) {
  if (typeof input !== "string") {
    return false;
  }
  for (let i2 = 0; i2 < input.length; i2++) {
    if (input.charCodeAt(i2) === 46) {
      return true;
    }
  }
  return false;
}
function mergeTags(tags1, tags2) {
  const tagMap = /* @__PURE__ */ new Map();
  const generateKey = (tag) => tag.join(",");
  const isContained = (smaller, larger) => {
    return smaller.every((value, index) => value === larger[index]);
  };
  const processTag = (tag) => {
    for (const [key, existingTag] of tagMap) {
      if (isContained(existingTag, tag) || isContained(tag, existingTag)) {
        if (tag.length >= existingTag.length) {
          tagMap.set(key, tag);
        }
        return;
      }
    }
    tagMap.set(generateKey(tag), tag);
  };
  tags1.concat(tags2).forEach(processTag);
  return Array.from(tagMap.values());
}
function uniqueTag(a, b) {
  const aLength = a.length;
  const bLength = b.length;
  const sameLength = aLength === bLength;
  if (sameLength) {
    if (a.every((v, i2) => v === b[i2])) {
      return [a];
    }
    return [a, b];
  }
  if (aLength > bLength && a.every((v, i2) => v === b[i2])) {
    return [a];
  }
  if (bLength > aLength && b.every((v, i2) => v === a[i2])) {
    return [b];
  }
  return [a, b];
}
var hashtagRegex = /(?<=\s|^)(#[^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g;
function generateHashtags(content) {
  const hashtags = content.match(hashtagRegex);
  const tagIds = /* @__PURE__ */ new Set();
  const tag = /* @__PURE__ */ new Set();
  if (hashtags) {
    for (const hashtag of hashtags) {
      if (tagIds.has(hashtag.slice(1))) continue;
      tag.add(hashtag.slice(1));
      tagIds.add(hashtag.slice(1));
    }
  }
  return Array.from(tag);
}
async function generateContentTags(content, tags = [], opts, ctx) {
  if (opts?.skipContentTagging) {
    return { content, tags };
  }
  const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+/g;
  const promises = [];
  const addTagIfNew = (t) => {
    if (!tags.find((t2) => ["q", t[0]].includes(t2[0]) && t2[1] === t[1])) {
      tags.push(t);
    }
  };
  content = content.replace(tagRegex, (tag) => {
    try {
      const entity = tag.split(/(@|nostr:)/)[2];
      const { type, data } = nip19_exports.decode(entity);
      let t;
      if (opts?.filters) {
        const shouldInclude = !opts.filters.includeTypes || opts.filters.includeTypes.includes(type);
        const shouldExclude = opts.filters.excludeTypes?.includes(type);
        if (!shouldInclude || shouldExclude) {
          return tag;
        }
      }
      switch (type) {
        case "npub":
          if (opts?.pTags !== false) {
            t = ["p", data];
          }
          break;
        case "nprofile":
          if (opts?.pTags !== false) {
            t = ["p", data.pubkey];
          }
          break;
        case "note":
          promises.push(
            new Promise(async (resolve) => {
              const relay = await maybeGetEventRelayUrl(entity);
              addTagIfNew(["q", data, relay]);
              resolve();
            })
          );
          break;
        case "nevent":
          promises.push(
            new Promise(async (resolve) => {
              const { id, author } = data;
              let { relays } = data;
              if (!relays || relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)];
              }
              addTagIfNew(["q", id, relays[0]]);
              if (author && opts?.pTags !== false && opts?.pTagOnQTags !== false)
                addTagIfNew(["p", author]);
              resolve();
            })
          );
          break;
        case "naddr":
          promises.push(
            new Promise(async (resolve) => {
              const id = [data.kind, data.pubkey, data.identifier].join(":");
              let relays = data.relays ?? [];
              if (relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)];
              }
              addTagIfNew(["q", id, relays[0]]);
              if (opts?.pTags !== false && opts?.pTagOnQTags !== false && opts?.pTagOnATags !== false)
                addTagIfNew(["p", data.pubkey]);
              resolve();
            })
          );
          break;
        default:
          return tag;
      }
      if (t) addTagIfNew(t);
      return `nostr:${entity}`;
    } catch (_error) {
      return tag;
    }
  });
  await Promise.all(promises);
  if (!opts?.filters?.excludeTypes?.includes("hashtag")) {
    const newTags = generateHashtags(content).map((hashtag) => ["t", hashtag]);
    tags = mergeTags(tags, newTags);
  }
  if (opts?.pTags !== false && opts?.copyPTagsFromTarget && ctx) {
    const pTags = ctx.getMatchingTags("p");
    for (const pTag of pTags) {
      if (!pTag[1] || !isValidPubkey(pTag[1])) continue;
      if (!tags.find((t) => t[0] === "p" && t[1] === pTag[1])) {
        tags.push(pTag);
      }
    }
  }
  return { content, tags };
}
async function maybeGetEventRelayUrl(_nip19Id) {
  return "";
}
async function encrypt4(recipient, signer, scheme = "nip44") {
  let encrypted;
  if (!this.ndk) throw new Error("No NDK instance found!");
  let currentSigner = signer;
  if (!currentSigner) {
    this.ndk.assertSigner();
    currentSigner = this.ndk.signer;
  }
  if (!currentSigner) throw new Error("no NDK signer");
  const currentRecipient = recipient || (() => {
    const pTags = this.getMatchingTags("p");
    if (pTags.length !== 1) {
      throw new Error("No recipient could be determined and no explicit recipient was provided");
    }
    return this.ndk.getUser({ pubkey: pTags[0][1] });
  })();
  if (scheme === "nip44" && await isEncryptionEnabled(currentSigner, "nip44")) {
    encrypted = await currentSigner.encrypt(currentRecipient, this.content, "nip44");
  }
  if ((!encrypted || scheme === "nip04") && await isEncryptionEnabled(currentSigner, "nip04")) {
    encrypted = await currentSigner.encrypt(currentRecipient, this.content, "nip04");
  }
  if (!encrypted) throw new Error("Failed to encrypt event.");
  this.content = encrypted;
}
async function decrypt4(sender, signer, scheme) {
  if (this.ndk?.cacheAdapter?.getDecryptedEvent) {
    const cachedEvent = await this.ndk.cacheAdapter.getDecryptedEvent(this.id);
    if (cachedEvent) {
      this.content = cachedEvent.content;
      return;
    }
  }
  let decrypted;
  if (!this.ndk) throw new Error("No NDK instance found!");
  let currentSigner = signer;
  if (!currentSigner) {
    this.ndk.assertSigner();
    currentSigner = this.ndk.signer;
  }
  if (!currentSigner) throw new Error("no NDK signer");
  const currentSender = sender || this.author;
  if (!currentSender) throw new Error("No sender provided and no author available");
  const currentScheme = scheme || (this.content.match(/\\?iv=/) ? "nip04" : "nip44");
  if ((currentScheme === "nip04" || this.kind === 4) && await isEncryptionEnabled(currentSigner, "nip04") && this.content.search("\\?iv=")) {
    decrypted = await currentSigner.decrypt(currentSender, this.content, "nip04");
  }
  if (!decrypted && currentScheme === "nip44" && await isEncryptionEnabled(currentSigner, "nip44")) {
    decrypted = await currentSigner.decrypt(currentSender, this.content, "nip44");
  }
  if (!decrypted) throw new Error("Failed to decrypt event.");
  this.content = decrypted;
  if (this.ndk?.cacheAdapter?.addDecryptedEvent) {
    this.ndk.cacheAdapter.addDecryptedEvent(this.id, this);
  }
}
async function isEncryptionEnabled(signer, scheme) {
  if (!signer.encryptionEnabled) return false;
  if (!scheme) return true;
  return Boolean(await signer.encryptionEnabled(scheme));
}
function eventsBySameAuthor(op, events) {
  const eventsByAuthor = /* @__PURE__ */ new Map();
  eventsByAuthor.set(op.id, op);
  events.forEach((event) => {
    if (event.pubkey === op.pubkey) {
      eventsByAuthor.set(event.id, event);
    }
  });
  return eventsByAuthor;
}
var hasMarkers = (event, tagType) => {
  return event.getMatchingTags(tagType).some((tag) => tag[3] && tag[3] !== "");
};
function eventIsReply(op, event, threadIds = /* @__PURE__ */ new Set(), tagType) {
  tagType ??= op.tagType();
  const tags = event.getMatchingTags(tagType);
  threadIds.add(op.tagId());
  if (threadIds.has(event.tagId())) return false;
  const heedExplicitReplyMarker = () => {
    let eventIsTagged = false;
    for (const tag of tags) {
      if (tag[3] === "reply") return threadIds.has(tag[1]);
      const markerIsEmpty = tag[3] === "" || tag[3] === void 0;
      const markerIsRoot = tag[3] === "root";
      if (tag[1] === op.tagId() && (markerIsEmpty || markerIsRoot)) {
        eventIsTagged = markerIsRoot ? "root" : true;
      }
    }
    if (!eventIsTagged) return false;
    if (eventIsTagged === "root") return true;
  };
  const explicitReplyMarker = heedExplicitReplyMarker();
  if (explicitReplyMarker !== void 0) return explicitReplyMarker;
  if (hasMarkers(event, tagType)) return false;
  const expectedTags = op.getMatchingTags("e").map((tag) => tag[1]);
  expectedTags.push(op.id);
  return event.getMatchingTags("e").every((tag) => expectedTags.includes(tag[1]));
}
function eventThreads(op, events) {
  const eventsByAuthor = eventsBySameAuthor(op, events);
  const threadEvents = events.filter((event) => eventIsPartOfThread(op, event, eventsByAuthor));
  return threadEvents.sort((a, b) => a.created_at - b.created_at);
}
function getEventReplyId(event) {
  const replyTag = getReplyTag(event);
  if (replyTag) return replyTag[1];
  const rootTag = getRootTag(event);
  if (rootTag) return rootTag[1];
}
function isEventOriginalPost(event) {
  return getEventReplyId(event) === void 0;
}
function eventThreadIds(op, events) {
  const threadIds = /* @__PURE__ */ new Map();
  const threadEvents = eventThreads(op, events);
  threadEvents.forEach((event) => threadIds.set(event.id, event));
  return threadIds;
}
function eventReplies(op, events, threadEventIds) {
  threadEventIds ??= new Set(eventThreadIds(op, events).keys());
  return events.filter((event) => eventIsReply(op, event, threadEventIds));
}
function eventIsPartOfThread(op, event, eventsByAuthor) {
  if (op.pubkey !== event.pubkey) return false;
  const taggedEventIds = event.getMatchingTags("e").map((tag) => tag[1]);
  const allTaggedEventsAreByOriginalAuthor = taggedEventIds.every((id) => eventsByAuthor.has(id));
  return allTaggedEventsAreByOriginalAuthor;
}
function eventHasETagMarkers(event) {
  for (const tag of event.tags) {
    if (tag[0] === "e" && (tag[3] ?? "").length > 0) return true;
  }
  return false;
}
function getRootEventId(event, searchTag) {
  searchTag ??= event.tagType();
  const rootEventTag = getRootTag(event, searchTag);
  if (rootEventTag) return rootEventTag[1];
  const replyTag = getReplyTag(event, searchTag);
  return replyTag?.[1];
}
function getRootTag(event, searchTag) {
  searchTag ??= event.tagType();
  const rootEventTag = event.tags.find(isTagRootTag);
  if (!rootEventTag) {
    if (eventHasETagMarkers(event)) return;
    const matchingTags = event.getMatchingTags(searchTag);
    if (matchingTags.length < 3) return matchingTags[0];
  }
  return rootEventTag;
}
var nip22RootTags = /* @__PURE__ */ new Set(["A", "E", "I"]);
var nip22ReplyTags = /* @__PURE__ */ new Set(["a", "e", "i"]);
function getReplyTag(event, searchTag) {
  if (event.kind === 1111) {
    let replyTag2;
    for (const tag of event.tags) {
      if (nip22RootTags.has(tag[0])) replyTag2 = tag;
      else if (nip22ReplyTags.has(tag[0])) {
        replyTag2 = tag;
        break;
      }
    }
    return replyTag2;
  }
  searchTag ??= event.tagType();
  let hasMarkers2 = false;
  let replyTag;
  for (const tag of event.tags) {
    if (tag[0] !== searchTag) continue;
    if ((tag[3] ?? "").length > 0) hasMarkers2 = true;
    if (hasMarkers2 && tag[3] === "reply") return tag;
    if (hasMarkers2 && tag[3] === "root") replyTag = tag;
    if (!hasMarkers2) replyTag = tag;
  }
  return replyTag;
}
function isTagRootTag(tag) {
  return tag[0] === "E" || tag[3] === "root";
}
async function fetchTaggedEvent(tag, marker) {
  if (!this.ndk) throw new Error("NDK instance not found");
  const t = this.getMatchingTags(tag, marker);
  if (t.length === 0) return void 0;
  const [_, id, hint] = t[0];
  const relay = hint !== "" ? this.ndk.pool.getRelay(hint) : void 0;
  const event = await this.ndk.fetchEvent(id, {}, relay);
  return event;
}
async function fetchRootEvent(subOpts) {
  if (!this.ndk) throw new Error("NDK instance not found");
  const rootTag = getRootTag(this);
  if (!rootTag) return void 0;
  return this.ndk.fetchEventFromTag(rootTag, this, subOpts);
}
async function fetchReplyEvent(subOpts) {
  if (!this.ndk) throw new Error("NDK instance not found");
  const replyTag = getReplyTag(this);
  if (!replyTag) return void 0;
  return this.ndk.fetchEventFromTag(replyTag, this, subOpts);
}
function isReplaceable() {
  if (this.kind === void 0) throw new Error("Kind not set");
  return [0, 3].includes(this.kind) || this.kind >= 1e4 && this.kind < 2e4 || this.kind >= 3e4 && this.kind < 4e4;
}
function isEphemeral() {
  if (this.kind === void 0) throw new Error("Kind not set");
  return this.kind >= 2e4 && this.kind < 3e4;
}
function isParamReplaceable() {
  if (this.kind === void 0) throw new Error("Kind not set");
  return this.kind >= 3e4 && this.kind < 4e4;
}
var DEFAULT_RELAY_COUNT = 2;
function encode(maxRelayCount = DEFAULT_RELAY_COUNT) {
  let relays = [];
  if (this.onRelays.length > 0) {
    relays = this.onRelays.map((relay) => relay.url);
  } else if (this.relay) {
    relays = [this.relay.url];
  }
  if (relays.length > maxRelayCount) {
    relays = relays.slice(0, maxRelayCount);
  }
  if (this.isParamReplaceable()) {
    return nip19_exports.naddrEncode({
      kind: this.kind,
      pubkey: this.pubkey,
      identifier: this.replaceableDTag(),
      relays
    });
  }
  if (relays.length > 0) {
    return nip19_exports.neventEncode({
      id: this.tagId(),
      relays,
      author: this.pubkey
    });
  }
  return nip19_exports.noteEncode(this.tagId());
}
async function repost(publish = true, signer) {
  if (!signer && publish) {
    if (!this.ndk) throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    signer = this.ndk.signer;
  }
  const e = new NDKEvent(this.ndk, {
    kind: getKind(this)
  });
  if (!this.isProtected) e.content = JSON.stringify(this.rawEvent());
  e.tag(this);
  if (this.kind !== 1) {
    e.tags.push(["k", `${this.kind}`]);
  }
  if (signer) await e.sign(signer);
  if (publish) await e.publish();
  return e;
}
function getKind(event) {
  if (event.kind === 1) {
    return 6;
  }
  return 16;
}
function getEventDetails(event) {
  if ("inspect" in event && typeof event.inspect === "string") {
    return event.inspect;
  }
  return JSON.stringify(event);
}
function validateForSerialization(event) {
  if (typeof event.kind !== "number") {
    throw new Error(
      `Can't serialize event with invalid properties: kind (must be number, got ${typeof event.kind}). Event: ${getEventDetails(event)}`
    );
  }
  if (typeof event.content !== "string") {
    throw new Error(
      `Can't serialize event with invalid properties: content (must be string, got ${typeof event.content}). Event: ${getEventDetails(event)}`
    );
  }
  if (typeof event.created_at !== "number") {
    throw new Error(
      `Can't serialize event with invalid properties: created_at (must be number, got ${typeof event.created_at}). Event: ${getEventDetails(event)}`
    );
  }
  if (typeof event.pubkey !== "string") {
    throw new Error(
      `Can't serialize event with invalid properties: pubkey (must be string, got ${typeof event.pubkey}). Event: ${getEventDetails(event)}`
    );
  }
  if (!Array.isArray(event.tags)) {
    throw new Error(
      `Can't serialize event with invalid properties: tags (must be array, got ${typeof event.tags}). Event: ${getEventDetails(event)}`
    );
  }
  for (let i2 = 0; i2 < event.tags.length; i2++) {
    const tag = event.tags[i2];
    if (!Array.isArray(tag)) {
      throw new Error(
        `Can't serialize event with invalid properties: tags[${i2}] (must be array, got ${typeof tag}). Event: ${getEventDetails(event)}`
      );
    }
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] !== "string") {
        throw new Error(
          `Can't serialize event with invalid properties: tags[${i2}][${j}] (must be string, got ${typeof tag[j]}). Event: ${getEventDetails(event)}`
        );
      }
    }
  }
}
function serialize(includeSig = false, includeId = false) {
  validateForSerialization(this);
  const payload = [0, this.pubkey, this.created_at, this.kind, this.tags, this.content];
  if (includeSig) payload.push(this.sig);
  if (includeId) payload.push(this.id);
  return JSON.stringify(payload);
}
function deserialize(serializedEvent) {
  const eventArray = JSON.parse(serializedEvent);
  const ret = {
    pubkey: eventArray[1],
    created_at: eventArray[2],
    kind: eventArray[3],
    tags: eventArray[4],
    content: eventArray[5]
  };
  if (eventArray.length >= 7) {
    const first = eventArray[6];
    const second = eventArray[7];
    if (first && first.length === 128) {
      ret.sig = first;
      if (second && second.length === 64) {
        ret.id = second;
      }
    } else if (first && first.length === 64) {
      ret.id = first;
      if (second && second.length === 128) {
        ret.sig = second;
      }
    }
  }
  return ret;
}
var worker;
var processingQueue = {};
function signatureVerificationInit(w) {
  worker = w;
  worker.onmessage = (msg) => {
    if (!Array.isArray(msg.data) || msg.data.length !== 2) {
      console.error(
        "[NDK] \u274C Signature verification worker received incompatible message format.",
        "\n\n\u{1F4CB} Expected format: [eventId, boolean]",
        "\n\u{1F4E6} Received:",
        msg.data,
        "\n\n\u{1F50D} This likely means:",
        "\n  1. You have a STALE worker.js file that needs updating",
        "\n  2. Version mismatch between @nostr-dev-kit/ndk and deployed worker",
        "\n  3. Wrong worker is being used for signature verification",
        "\n\n\u2705 Solution: Update your worker files:",
        "\n  cp node_modules/@nostr-dev-kit/ndk/dist/workers/sig-verification.js public/",
        "\n  cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/",
        "\n\n\u{1F4A1} Or use Vite/bundler imports instead of static files:",
        '\n  import SigWorker from "@nostr-dev-kit/ndk/workers/sig-verification?worker"'
      );
      return;
    }
    const [eventId, result] = msg.data;
    const record = processingQueue[eventId];
    if (!record) {
      console.error("No record found for event", eventId);
      return;
    }
    delete processingQueue[eventId];
    for (const resolve of record.resolves) {
      resolve(result);
    }
  };
}
async function verifySignatureAsync(event, _persist, relay) {
  const ndkInstance = event.ndk;
  const start = Date.now();
  let result;
  if (ndkInstance.signatureVerificationFunction) {
    result = await ndkInstance.signatureVerificationFunction(event);
  } else {
    result = await new Promise((resolve) => {
      const serialized = event.serialize();
      let enqueue = false;
      if (!processingQueue[event.id]) {
        processingQueue[event.id] = { event, resolves: [], relay };
        enqueue = true;
      }
      processingQueue[event.id].resolves.push(resolve);
      if (!enqueue) return;
      worker?.postMessage({
        serialized,
        id: event.id,
        sig: event.sig,
        pubkey: event.pubkey
      });
    });
  }
  ndkInstance.signatureVerificationTimeMs += Date.now() - start;
  return result;
}
var PUBKEY_REGEX = /^[a-f0-9]{64}$/;
function validate() {
  if (typeof this.kind !== "number") return false;
  if (typeof this.content !== "string") return false;
  if (typeof this.created_at !== "number") return false;
  if (typeof this.pubkey !== "string") return false;
  if (!this.pubkey.match(PUBKEY_REGEX)) return false;
  if (!Array.isArray(this.tags)) return false;
  for (let i2 = 0; i2 < this.tags.length; i2++) {
    const tag = this.tags[i2];
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false;
    }
  }
  return true;
}
var verifiedSignatures = new import_typescript_lru_cache.LRUCache({
  maxSize: 1e3,
  entryExpirationTimeInMS: 6e4
});
function verifySignature(persist) {
  if (typeof this.signatureVerified === "boolean") return this.signatureVerified;
  const prevVerification = verifiedSignatures.get(this.id);
  if (prevVerification !== null) {
    this.signatureVerified = !!prevVerification;
    return this.signatureVerified;
  }
  try {
    if (this.ndk?.asyncSigVerification) {
      const relayForVerification = this.relay;
      verifySignatureAsync(this, persist, relayForVerification).then((result) => {
        if (persist) {
          this.signatureVerified = result;
          if (result) verifiedSignatures.set(this.id, this.sig);
        }
        if (!result) {
          if (relayForVerification) {
            this.ndk?.reportInvalidSignature(this, relayForVerification);
          } else {
            this.ndk?.reportInvalidSignature(this);
          }
          verifiedSignatures.set(this.id, false);
        } else {
          if (relayForVerification) {
            relayForVerification.addValidatedEvent();
          }
        }
      }).catch((err) => {
        console.error("signature verification error", this.id, err);
      });
    } else {
      const hash = sha2563(new TextEncoder().encode(this.serialize()));
      const res = schnorr2.verify(this.sig, hash, this.pubkey);
      if (res) verifiedSignatures.set(this.id, this.sig);
      else verifiedSignatures.set(this.id, false);
      this.signatureVerified = res;
      return res;
    }
  } catch (_err) {
    this.signatureVerified = false;
    return false;
  }
}
function getEventHash2() {
  return getEventHashFromSerializedEvent(this.serialize());
}
function getEventHashFromSerializedEvent(serializedEvent) {
  const eventHash = sha2563(new TextEncoder().encode(serializedEvent));
  return bytesToHex3(eventHash);
}
var skipClientTagOnKinds = /* @__PURE__ */ new Set([
  0,
  4,
  1059,
  13,
  3,
  9734,
  5
  /* EventDeletion */
]);
var NDKEvent = class _NDKEvent extends import_tseep.EventEmitter {
  ndk;
  created_at;
  content = "";
  tags = [];
  kind;
  id = "";
  sig;
  pubkey = "";
  signatureVerified;
  _author = void 0;
  /**
   * The relay that this event was first received from.
   */
  relay;
  /**
   * The relays that this event was received from and/or successfully published to.
   */
  get onRelays() {
    let res = [];
    if (!this.ndk) {
      if (this.relay) res.push(this.relay);
    } else {
      res = this.ndk.subManager.seenEvents.get(this.id) || [];
    }
    return res;
  }
  /**
   * The status of the publish operation.
   */
  publishStatus = "success";
  publishError;
  constructor(ndk, event) {
    super();
    this.ndk = ndk;
    this.created_at = event?.created_at;
    this.content = event?.content || "";
    this.tags = event?.tags || [];
    this.id = event?.id || "";
    this.sig = event?.sig;
    this.pubkey = event?.pubkey || "";
    this.kind = event?.kind;
    if (event instanceof _NDKEvent) {
      if (this.relay) {
        this.relay = event.relay;
        this.ndk?.subManager.seenEvent(event.id, this.relay);
      }
      this.publishStatus = event.publishStatus;
      this.publishError = event.publishError;
    }
  }
  /**
   * Deserialize an NDKEvent from a serialized payload.
   * @param ndk
   * @param event
   * @returns
   */
  static deserialize(ndk, event) {
    return new _NDKEvent(ndk, deserialize(event));
  }
  /**
   * Returns the event as is.
   */
  rawEvent() {
    return {
      created_at: this.created_at,
      content: this.content,
      tags: this.tags,
      kind: this.kind,
      pubkey: this.pubkey,
      id: this.id,
      sig: this.sig
    };
  }
  set author(user) {
    this.pubkey = user.pubkey;
    this._author = user;
    this._author.ndk ??= this.ndk;
  }
  /**
   * Returns an NDKUser for the author of the event.
   */
  get author() {
    if (this._author) return this._author;
    if (!this.ndk) throw new Error("No NDK instance found");
    const user = this.ndk.getUser({ pubkey: this.pubkey });
    this._author = user;
    return user;
  }
  /**
   * NIP-73 tagging of external entities
   * @param entity to be tagged
   * @param type of the entity
   * @param markerUrl to be used as the marker URL
   *
   * @example
   * ```typescript
   * event.tagExternal("https://example.com/article/123#nostr", "url");
   * event.tags => [["i", "https://example.com/123"], ["k", "https://example.com"]]
   * ```
   *
   * @example tag a podcast:item:guid
   * ```typescript
   * event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:item:guid");
   * event.tags => [["i", "podcast:item:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5"], ["k", "podcast:item:guid"]]
   * ```
   *
   * @see https://github.com/nostr-protocol/nips/blob/master/73.md
   */
  tagExternal(entity, type, markerUrl) {
    const iTag = ["i"];
    const kTag = ["k"];
    switch (type) {
      case "url": {
        const url = new URL(entity);
        url.hash = "";
        iTag.push(url.toString());
        kTag.push(`${url.protocol}//${url.host}`);
        break;
      }
      case "hashtag":
        iTag.push(`#${entity.toLowerCase()}`);
        kTag.push("#");
        break;
      case "geohash":
        iTag.push(`geo:${entity.toLowerCase()}`);
        kTag.push("geo");
        break;
      case "isbn":
        iTag.push(`isbn:${entity.replace(/-/g, "")}`);
        kTag.push("isbn");
        break;
      case "podcast:guid":
        iTag.push(`podcast:guid:${entity}`);
        kTag.push("podcast:guid");
        break;
      case "podcast:item:guid":
        iTag.push(`podcast:item:guid:${entity}`);
        kTag.push("podcast:item:guid");
        break;
      case "podcast:publisher:guid":
        iTag.push(`podcast:publisher:guid:${entity}`);
        kTag.push("podcast:publisher:guid");
        break;
      case "isan":
        iTag.push(`isan:${entity.split("-").slice(0, 4).join("-")}`);
        kTag.push("isan");
        break;
      case "doi":
        iTag.push(`doi:${entity.toLowerCase()}`);
        kTag.push("doi");
        break;
      default:
        throw new Error(`Unsupported NIP-73 entity type: ${type}`);
    }
    if (markerUrl) {
      iTag.push(markerUrl);
    }
    this.tags.push(iTag);
    this.tags.push(kTag);
  }
  /**
   * Tag a user with an optional marker.
   * @param target What is to be tagged. Can be an NDKUser, NDKEvent, or an NDKTag.
   * @param marker The marker to use in the tag.
   * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event.
   * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag.
   * @param opts Optional content tagging options to control p tag behavior.
   * @example
   * ```typescript
   * reply.tag(opEvent, "reply");
   * // reply.tags => [["e", <id>, <relay>, "reply"]]
   * ```
   */
  tag(target, marker, skipAuthorTag, forceTag, opts) {
    let tags = [];
    const isNDKUser = target.fetchProfile !== void 0;
    if (isNDKUser) {
      forceTag ??= "p";
      if (forceTag === "p" && opts?.pTags === false) {
        return;
      }
      const tag = [forceTag, target.pubkey];
      if (marker) tag.push(...["", marker]);
      tags.push(tag);
    } else if (target instanceof _NDKEvent) {
      const event = target;
      skipAuthorTag ??= event?.pubkey === this.pubkey;
      tags = event.referenceTags(marker, skipAuthorTag, forceTag, opts);
      if (opts?.pTags !== false) {
        for (const pTag of event.getMatchingTags("p")) {
          if (!pTag[1] || !isValidPubkey(pTag[1])) continue;
          if (pTag[1] === this.pubkey) continue;
          if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1])) continue;
          this.tags.push(["p", pTag[1]]);
        }
      }
    } else if (Array.isArray(target)) {
      tags = [target];
    } else {
      throw new Error("Invalid argument", target);
    }
    this.tags = mergeTags(this.tags, tags);
  }
  /**
   * Return a NostrEvent object, trying to fill in missing fields
   * when possible, adding tags when necessary.
   * @param pubkey {string} The pubkey of the user who the event belongs to.
   * @param opts {ContentTaggingOptions} Options for content tagging.
   * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
   */
  async toNostrEvent(pubkey, opts) {
    if (!pubkey && this.pubkey === "") {
      const user = await this.ndk?.signer?.user();
      this.pubkey = user?.pubkey || "";
    }
    if (!this.created_at) {
      this.created_at = Math.floor(Date.now() / 1e3);
    }
    const { content, tags } = await this.generateTags(opts);
    this.content = content || "";
    this.tags = tags;
    try {
      this.id = this.getEventHash();
    } catch (_e) {
    }
    return this.rawEvent();
  }
  serialize = serialize.bind(this);
  getEventHash = getEventHash2.bind(this);
  validate = validate.bind(this);
  verifySignature = verifySignature.bind(this);
  /**
   * Is this event replaceable (whether parameterized or not)?
   *
   * This will return true for kind 0, 3, 10k-20k and 30k-40k
   */
  isReplaceable = isReplaceable.bind(this);
  isEphemeral = isEphemeral.bind(this);
  isDvm = () => this.kind && this.kind >= 5e3 && this.kind <= 7e3;
  /**
   * Is this event parameterized replaceable?
   *
   * This will return true for kind 30k-40k
   */
  isParamReplaceable = isParamReplaceable.bind(this);
  /**
   * Encodes a bech32 id.
   *
   * @param relays {string[]} The relays to encode in the id
   * @returns {string} - Encoded naddr, note or nevent.
   */
  encode = encode.bind(this);
  encrypt = encrypt4.bind(this);
  decrypt = decrypt4.bind(this);
  /**
   * Get all tags with the given name
   * @param tagName {string} The name of the tag to search for
   * @returns {NDKTag[]} An array of the matching tags
   */
  getMatchingTags(tagName, marker) {
    const t = this.tags.filter((tag) => tag[0] === tagName);
    if (marker === void 0) return t;
    return t.filter((tag) => tag[3] === marker);
  }
  /**
   * Check if the event has a tag with the given name
   * @param tagName
   * @param marker
   * @returns
   */
  hasTag(tagName, marker) {
    return this.tags.some((tag) => tag[0] === tagName && (!marker || tag[3] === marker));
  }
  /**
   * Get the first tag with the given name
   * @param tagName Tag name to search for
   * @returns The value of the first tag with the given name, or undefined if no such tag exists
   */
  tagValue(tagName, marker) {
    const tags = this.getMatchingTags(tagName, marker);
    if (tags.length === 0) return void 0;
    return tags[0][1];
  }
  /**
   * Gets the NIP-31 "alt" tag of the event.
   */
  get alt() {
    return this.tagValue("alt");
  }
  /**
   * Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
   * clients that don't handle a particular event kind can display something
   * useful for users.
   */
  set alt(alt) {
    this.removeTag("alt");
    if (alt) this.tags.push(["alt", alt]);
  }
  /**
   * Gets the NIP-33 "d" tag of the event.
   */
  get dTag() {
    return this.tagValue("d");
  }
  /**
   * Sets the NIP-33 "d" tag of the event.
   */
  set dTag(value) {
    this.removeTag("d");
    if (value) this.tags.push(["d", value]);
  }
  /**
   * Remove all tags with the given name (e.g. "d", "a", "p")
   * @param tagName Tag name(s) to search for and remove
   * @param marker Optional marker to check for too
   *
   * @example
   * Remove a tags with a "defer" marker
   * ```typescript
   * event.tags = [
   *   ["a", "....", "defer"],
   *   ["a", "....", "no-defer"],
   * ]
   *
   * event.removeTag("a", "defer");
   *
   * // event.tags => [["a", "....", "no-defer"]]
   *
   * @returns {void}
   */
  removeTag(tagName, marker) {
    const tagNames = Array.isArray(tagName) ? tagName : [tagName];
    this.tags = this.tags.filter((tag) => {
      const include = tagNames.includes(tag[0]);
      const hasMarker = marker ? tag[3] === marker : true;
      return !(include && hasMarker);
    });
  }
  /**
   * Replace a tag with a new value. If not found, it will be added.
   * @param tag The tag to replace.
   * @param value The new value for the tag.
   */
  replaceTag(tag) {
    this.removeTag(tag[0]);
    this.tags.push(tag);
  }
  /**
   * Sign the event if a signer is present.
   *
   * It will generate tags.
   * Repleacable events will have their created_at field set to the current time.
   * @param signer {NDKSigner} The NDKSigner to use to sign the event
   * @param opts {ContentTaggingOptions} Options for content tagging.
   * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
   */
  async sign(signer, opts) {
    this.ndk?.aiGuardrails?.event?.signing(this);
    if (!signer) {
      this.ndk?.assertSigner();
      signer = this.ndk?.signer;
    } else {
      this.author = await signer.user();
    }
    const nostrEvent = await this.toNostrEvent(void 0, opts);
    this.sig = await signer.sign(nostrEvent);
    return this.sig;
  }
  /**
   *
   * @param relaySet
   * @param timeoutMs
   * @param requiredRelayCount
   * @returns
   */
  async publishReplaceable(relaySet, timeoutMs, requiredRelayCount) {
    this.id = "";
    this.created_at = Math.floor(Date.now() / 1e3);
    this.sig = "";
    return this.publish(relaySet, timeoutMs, requiredRelayCount);
  }
  /**
   * Attempt to sign and then publish an NDKEvent to a given relaySet.
   * If no relaySet is provided, the relaySet will be calculated by NDK.
   * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
   * @param timeoutM {number} The timeout for the publish operation in milliseconds.
   * @param requiredRelayCount The number of relays that must receive the event for the publish to be considered successful.
   * @param opts {ContentTaggingOptions} Options for content tagging.
   * @returns A promise that resolves to the relays the event was published to.
   */
  async publish(relaySet, timeoutMs, requiredRelayCount, opts) {
    if (!requiredRelayCount) requiredRelayCount = 1;
    if (!this.sig) await this.sign(void 0, opts);
    if (!this.ndk) throw new Error("NDKEvent must be associated with an NDK instance to publish");
    this.ndk.aiGuardrails?.event?.publishing(this);
    if (!relaySet || relaySet.size === 0) {
      relaySet = this.ndk.devWriteRelaySet || await calculateRelaySetFromEvent(this.ndk, this, requiredRelayCount);
    }
    if (this.kind === 5 && this.ndk.cacheAdapter?.deleteEventIds) {
      const eTags = this.getMatchingTags("e").map((tag) => tag[1]);
      this.ndk.cacheAdapter.deleteEventIds(eTags);
    }
    const rawEvent = this.rawEvent();
    if (this.ndk.cacheAdapter?.addUnpublishedEvent && shouldTrackUnpublishedEvent(this)) {
      try {
        this.ndk.cacheAdapter.addUnpublishedEvent(this, relaySet.relayUrls);
      } catch (e) {
        console.error("Error adding unpublished event to cache", e);
      }
    }
    if (this.kind === 5 && this.ndk.cacheAdapter?.deleteEventIds) {
      this.ndk.cacheAdapter.deleteEventIds(this.getMatchingTags("e").map((tag) => tag[1]));
    }
    this.ndk.subManager.dispatchEvent(rawEvent, void 0, true);
    const relays = await relaySet.publish(this, timeoutMs, requiredRelayCount);
    relays.forEach((relay) => this.ndk?.subManager.seenEvent(this.id, relay));
    return relays;
  }
  /**
   * Generates tags for users, notes, and other events tagged in content.
   * Will also generate random "d" tag for parameterized replaceable events where needed.
   * @param opts {ContentTaggingOptions} Options for content tagging.
   * @returns {ContentTag} The tags and content of the event.
   */
  async generateTags(opts) {
    let tags = [];
    const g = await generateContentTags(this.content, this.tags, opts, this);
    const content = g.content;
    tags = g.tags;
    if (this.kind && this.isParamReplaceable()) {
      const dTag = this.getMatchingTags("d")[0];
      if (!dTag) {
        const title = this.tagValue("title");
        const randLength = title ? 6 : 16;
        let str = [...Array(randLength)].map(() => Math.random().toString(36)[2]).join("");
        if (title && title.length > 0) {
          str = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${str}`;
        }
        tags.push(["d", str]);
      }
    }
    if (this.shouldAddClientTag) {
      const clientTag = ["client", this.ndk?.clientName ?? ""];
      if (this.ndk?.clientNip89) clientTag.push(this.ndk?.clientNip89);
      tags.push(clientTag);
    } else if (this.shouldStripClientTag) {
      tags = tags.filter((tag) => tag[0] !== "client");
    }
    return { content: content || "", tags };
  }
  get shouldAddClientTag() {
    if (!this.ndk?.clientName && !this.ndk?.clientNip89) return false;
    if (skipClientTagOnKinds.has(this.kind)) return false;
    if (this.isEphemeral()) return false;
    if (this.isReplaceable() && !this.isParamReplaceable()) return false;
    if (this.isDvm()) return false;
    if (this.hasTag("client")) return false;
    return true;
  }
  get shouldStripClientTag() {
    return skipClientTagOnKinds.has(this.kind);
  }
  muted() {
    if (this.ndk?.muteFilter && this.ndk.muteFilter(this)) {
      return "muted";
    }
    return null;
  }
  /**
   * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
   * a parameterized replaceable event.
   * @returns {string} the "d" tag of the event.
   *
   * @deprecated Use `dTag` instead.
   */
  replaceableDTag() {
    if (this.kind && this.kind >= 3e4 && this.kind <= 4e4) {
      const dTag = this.getMatchingTags("d")[0];
      const dTagId = dTag ? dTag[1] : "";
      return dTagId;
    }
    throw new Error("Event is not a parameterized replaceable event");
  }
  /**
   * Provides a deduplication key for the event.
   *
   * For kinds 0, 3, 10k-20k this will be the event <kind>:<pubkey>
   * For kinds 30k-40k this will be the event <kind>:<pubkey>:<d-tag>
   * For all other kinds this will be the event id
   */
  deduplicationKey() {
    if (this.kind === 0 || this.kind === 3 || this.kind && this.kind >= 1e4 && this.kind < 2e4) {
      return `${this.kind}:${this.pubkey}`;
    }
    return this.tagId();
  }
  /**
   * Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.
   * @returns {string} The id
   */
  tagId() {
    if (this.isParamReplaceable()) {
      return this.tagAddress();
    }
    return this.id;
  }
  /**
   * Returns a stable reference value for a replaceable event.
   *
   * Param replaceable events are returned in the expected format of `<kind>:<pubkey>:<d-tag>`.
   * Kind-replaceable events are returned in the format of `<kind>:<pubkey>:`.
   *
   * @returns {string} A stable reference value for replaceable events
   */
  tagAddress() {
    if (this.isParamReplaceable()) {
      const dTagId = this.dTag ?? "";
      return `${this.kind}:${this.pubkey}:${dTagId}`;
    }
    if (this.isReplaceable()) {
      return `${this.kind}:${this.pubkey}:`;
    }
    throw new Error("Event is not a replaceable event");
  }
  /**
   * Determines the type of tag that can be used to reference this event from another event.
   * @returns {string} The tag type
   * @example
   * event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   * event.tagType(); // "a"
   */
  tagType() {
    return this.isParamReplaceable() ? "a" : "e";
  }
  /**
   * Get the tag that can be used to reference this event from another event.
   *
   * Consider using referenceTags() instead (unless you have a good reason to use this)
   *
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.tagReference(); // ["a", "30000:pubkey:d-code"]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.tagReference(); // ["e", "eventid"]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  tagReference(marker) {
    let tag;
    if (this.isParamReplaceable()) {
      tag = ["a", this.tagAddress()];
    } else {
      tag = ["e", this.tagId()];
    }
    if (this.relay) {
      tag.push(this.relay.url);
    } else {
      tag.push("");
    }
    tag.push(marker ?? "");
    if (!this.isParamReplaceable()) {
      tag.push(this.pubkey);
    }
    return tag;
  }
  /**
   * Get the tags that can be used to reference this event from another event
   * @param marker The marker to use in the tag
   * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event
   * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.referenceTags(); // [["a", "30000:pubkey:d-code"], ["e", "parent-id"]]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.referenceTags(); // [["e", "parent-id"]]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  referenceTags(marker, skipAuthorTag, forceTag, opts) {
    let tags = [];
    if (this.isParamReplaceable()) {
      tags = [
        [forceTag ?? "a", this.tagAddress()],
        [forceTag ?? "e", this.id]
      ];
    } else {
      tags = [[forceTag ?? "e", this.id]];
    }
    tags = tags.map((tag) => {
      if (tag[0] === "e" || marker) {
        tag.push(this.relay?.url ?? "");
      } else if (this.relay?.url) {
        tag.push(this.relay?.url);
      }
      return tag;
    });
    tags.forEach((tag) => {
      if (tag[0] === "e") {
        tag.push(marker ?? "");
        tag.push(this.pubkey);
      } else if (marker) {
        tag.push(marker);
      }
    });
    tags = [...tags, ...this.getMatchingTags("h")];
    if (!skipAuthorTag && opts?.pTags !== false) tags.push(...this.author.referenceTags());
    return tags;
  }
  /**
   * Provides the filter that will return matching events for this event.
   *
   * @example
   *    event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *    event.filter(); // { "#a": ["30000:pubkey:d-code"] }
   * @example
   *    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *    event.filter(); // { "#e": ["eventid"] }
   *
   * @returns The filter that will return matching events for this event
   */
  filter() {
    if (this.isParamReplaceable()) {
      return { "#a": [this.tagId()] };
    }
    return { "#e": [this.tagId()] };
  }
  nip22Filter() {
    if (this.isParamReplaceable()) {
      return { "#A": [this.tagId()] };
    }
    return { "#E": [this.tagId()] };
  }
  /**
   * Generates a deletion event of the current event
   *
   * @param reason The reason for the deletion
   * @param publish Whether to publish the deletion event automatically
   * @returns The deletion event
   */
  async delete(reason, publish = true) {
    if (!this.ndk) throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 5,
      content: reason || ""
    });
    e.tag(this, void 0, true);
    e.tags.push(["k", this.kind?.toString()]);
    if (publish) {
      this.emit("deleted");
      await e.publish();
    }
    return e;
  }
  /**
   * Establishes whether this is a NIP-70-protectede event.
   * @@satisfies NIP-70
   */
  set isProtected(val) {
    this.removeTag("-");
    if (val) this.tags.push(["-"]);
  }
  /**
   * Whether this is a NIP-70-protected event.
   * @@satisfies NIP-70
   */
  get isProtected() {
    return this.hasTag("-");
  }
  /**
   * Fetch an event tagged with the given tag following relay hints if provided.
   * @param tag The tag to search for
   * @param marker The marker to use in the tag (e.g. "root")
   * @returns The fetched event or null if no event was found, undefined if no matching tag was found in the event
   * * @example
   * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
   * const originalEvent = await replyEvent.fetchTaggedEvent("e", "reply");
   * console.log(replyEvent.encode() + " is a reply to event " + originalEvent?.encode());
   */
  fetchTaggedEvent = fetchTaggedEvent.bind(this);
  /**
   * Fetch the root event of the current event.
   * @returns The fetched root event or null if no event was found
   * @example
   * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
   * const rootEvent = await replyEvent.fetchRootEvent();
   * console.log(replyEvent.encode() + " is a reply in the thread " + rootEvent?.encode());
   */
  fetchRootEvent = fetchRootEvent.bind(this);
  /**
   * Fetch the event the current event is replying to.
   * @returns The fetched reply event or null if no event was found
   */
  fetchReplyEvent = fetchReplyEvent.bind(this);
  /**
   * NIP-18 reposting event.
   *
   * @param publish Whether to publish the reposted event automatically @default true
   * @param signer The signer to use for signing the reposted event
   * @returns The reposted event
   *
   * @function
   */
  repost = repost.bind(this);
  /**
   * React to an existing event
   *
   * @param content The content of the reaction
   */
  async react(content, publish = true) {
    if (!this.ndk) throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 7,
      content
    });
    e.tag(this);
    if (this.kind !== 1) {
      e.tags.push(["k", `${this.kind}`]);
    }
    if (publish) await e.publish();
    return e;
  }
  /**
   * Checks whether the event is valid per underlying NIPs.
   *
   * This method is meant to be overridden by subclasses that implement specific NIPs
   * to allow the enforcement of NIP-specific validation rules.
   *
   * Otherwise, it will only check for basic event properties.
   *
   */
  get isValid() {
    return this.validate();
  }
  get inspect() {
    return JSON.stringify(this.rawEvent(), null, 4);
  }
  /**
   * Dump the event to console for debugging purposes.
   * Prints a JSON stringified version of rawEvent() with indentation
   * and also lists all relay URLs for onRelays.
   */
  dump() {
    console.debug(JSON.stringify(this.rawEvent(), null, 4));
    console.debug("Event on relays:", this.onRelays.map((relay) => relay.url).join(", "));
  }
  /**
   * Creates a reply event for the current event.
   *
   * This function will use NIP-22 when appropriate (i.e. replies to non-kind:1 events).
   * This function does not have side-effects; it will just return an event with the appropriate tags
   * to generate the reply event; the caller is responsible for publishing the event.
   *
   * @param forceNip22 - Optional flag to force NIP-22 style replies (kind 1111) regardless of the original event's kind
   * @param opts - Optional content tagging options
   */
  reply(forceNip22, opts) {
    const reply = new _NDKEvent(this.ndk);
    this.ndk?.aiGuardrails?.event?.creatingReply(reply);
    if (this.kind === 1 && !forceNip22) {
      reply.kind = 1;
      const opHasETag = this.hasTag("e");
      if (opHasETag) {
        reply.tags = [
          ...reply.tags,
          ...this.getMatchingTags("e"),
          ...this.getMatchingTags("p"),
          ...this.getMatchingTags("a"),
          ...this.referenceTags("reply", false, void 0, opts)
        ];
      } else {
        reply.tag(this, "root", false, void 0, opts);
      }
    } else {
      reply.kind = 1111;
      const carryOverTags = ["A", "E", "I", "P"];
      const rootTags = this.tags.filter((tag) => carryOverTags.includes(tag[0]));
      if (rootTags.length > 0) {
        const rootKind = this.tagValue("K");
        reply.tags.push(...rootTags);
        if (rootKind) reply.tags.push(["K", rootKind]);
        let tag;
        if (this.isParamReplaceable()) {
          tag = ["a", this.tagAddress()];
          const relayHint = this.relay?.url ?? "";
          if (relayHint) tag.push(relayHint);
        } else {
          tag = ["e", this.tagId()];
          const relayHint = this.relay?.url ?? "";
          tag.push(relayHint);
          tag.push(this.pubkey);
        }
        reply.tags.push(tag);
      } else {
        let lowerTag;
        let upperTag;
        const relayHint = this.relay?.url ?? "";
        if (this.isParamReplaceable()) {
          lowerTag = ["a", this.tagAddress(), relayHint];
          upperTag = ["A", this.tagAddress(), relayHint];
        } else {
          lowerTag = ["e", this.tagId(), relayHint, this.pubkey];
          upperTag = ["E", this.tagId(), relayHint, this.pubkey];
        }
        reply.tags.push(lowerTag);
        reply.tags.push(upperTag);
        reply.tags.push(["K", this.kind?.toString()]);
        if (opts?.pTags !== false && opts?.pTagOnATags !== false) {
          reply.tags.push(["P", this.pubkey]);
        }
      }
      reply.tags.push(["k", this.kind?.toString()]);
      if (opts?.pTags !== false) {
        reply.tags.push(...this.getMatchingTags("p"));
        reply.tags.push(["p", this.pubkey]);
      }
    }
    return reply;
  }
};
var untrackedUnpublishedEvents = /* @__PURE__ */ new Set([
  24133,
  13194,
  23194,
  23195
  /* NostrWalletConnectRes */
]);
function shouldTrackUnpublishedEvent(event) {
  return !untrackedUnpublishedEvents.has(event.kind);
}
function isSignedEvent(event) {
  return !!(event.sig && event.id && event.created_at && event.created_at > 0);
}
function isUnsignedEvent(event) {
  return !isSignedEvent(event);
}
function assertSignedEvent(event) {
  if (!isSignedEvent(event)) {
    throw new Error("Expected signed event but event is not signed");
  }
}
function createSignedEvent(event) {
  if (!isSignedEvent(event)) {
    throw new Error("Cannot create signed event from unsigned event");
  }
  Object.defineProperty(event, "signed", { value: true, writable: false, enumerable: false });
  return event;
}
var NDKPool = class extends import_tseep3.EventEmitter {
  // TODO: This should probably be an LRU cache
  _relays = /* @__PURE__ */ new Map();
  status = "idle";
  autoConnectRelays = /* @__PURE__ */ new Set();
  debug;
  temporaryRelayTimers = /* @__PURE__ */ new Map();
  flappingRelays = /* @__PURE__ */ new Set();
  // A map to store timeouts for each flapping relay.
  backoffTimes = /* @__PURE__ */ new Map();
  ndk;
  // System-wide disconnection detection
  disconnectionTimes = /* @__PURE__ */ new Map();
  systemEventDetector;
  /**
   * @param relayUrls - The URLs of the relays to connect to.
   * @param ndk - The NDK instance.
   * @param opts - Options for the pool.
   */
  constructor(relayUrls, ndk, {
    debug: debug9,
    name
  } = {}) {
    super();
    this.debug = debug9 ?? ndk.debug.extend("pool");
    if (name) this._name = name;
    this.ndk = ndk;
    this.relayUrls = relayUrls;
    if (this.ndk.pools) {
      this.ndk.pools.push(this);
    }
  }
  get relays() {
    return this._relays;
  }
  set relayUrls(urls) {
    this._relays.clear();
    for (const relayUrl of urls) {
      const relay = new NDKRelay(relayUrl, void 0, this.ndk);
      relay.connectivity.netDebug = this.ndk.netDebug;
      this.addRelay(relay);
    }
  }
  _name = "unnamed";
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
    this.debug = this.debug.extend(name);
  }
  /**
   * Adds a relay to the pool, and sets a timer to remove it if it is not used within the specified time.
   * @param relay - The relay to add to the pool.
   * @param removeIfUnusedAfter - The time in milliseconds to wait before removing the relay from the pool after it is no longer used.
   */
  useTemporaryRelay(relay, removeIfUnusedAfter = 3e4, filters) {
    const relayAlreadyInPool = this.relays.has(relay.url);
    if (!relayAlreadyInPool) {
      this.addRelay(relay);
      this.debug("Adding temporary relay %s for filters %o", relay.url, filters);
    }
    const existingTimer = this.temporaryRelayTimers.get(relay.url);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    if (!relayAlreadyInPool || existingTimer) {
      const timer = setTimeout(() => {
        if (this.ndk.explicitRelayUrls?.includes(relay.url)) return;
        this.removeRelay(relay.url);
      }, removeIfUnusedAfter);
      this.temporaryRelayTimers.set(relay.url, timer);
    }
  }
  /**
   * Adds a relay to the pool.
   *
   * @param relay - The relay to add to the pool.
   * @param connect - Whether or not to connect to the relay.
   */
  addRelay(relay, connect = true) {
    const isAlreadyInPool = this.relays.has(relay.url);
    const isCustomRelayUrl = relay.url.includes("/npub1");
    let reconnect = true;
    const relayUrl = relay.url;
    if (isAlreadyInPool) return;
    if (this.ndk.relayConnectionFilter && !this.ndk.relayConnectionFilter(relayUrl)) {
      this.debug(`Refusing to add relay ${relayUrl}: blocked by relayConnectionFilter`);
      return;
    }
    if (isCustomRelayUrl) {
      this.debug(`Refusing to add relay ${relayUrl}: is a filter relay`);
      return;
    }
    if (this.ndk.cacheAdapter?.getRelayStatus) {
      const infoOrPromise = this.ndk.cacheAdapter.getRelayStatus(relayUrl);
      const info = infoOrPromise instanceof Promise ? void 0 : infoOrPromise;
      if (info?.dontConnectBefore) {
        if (info.dontConnectBefore > Date.now()) {
          const delay = info.dontConnectBefore - Date.now();
          this.debug(`Refusing to add relay ${relayUrl}: delayed connect for ${delay}ms`);
          setTimeout(() => {
            this.addRelay(relay, connect);
          }, delay);
          return;
        }
        reconnect = false;
      }
    }
    const noticeHandler = (notice) => this.emit("notice", relay, notice);
    const connectHandler = () => this.handleRelayConnect(relayUrl);
    const readyHandler = () => this.handleRelayReady(relay);
    const disconnectHandler = () => {
      this.recordDisconnection(relay);
      this.emit("relay:disconnect", relay);
    };
    const flappingHandler = () => this.handleFlapping(relay);
    const authHandler = (challenge3) => this.emit("relay:auth", relay, challenge3);
    const authedHandler = () => this.emit("relay:authed", relay);
    relay.off("notice", noticeHandler);
    relay.off("connect", connectHandler);
    relay.off("ready", readyHandler);
    relay.off("disconnect", disconnectHandler);
    relay.off("flapping", flappingHandler);
    relay.off("auth", authHandler);
    relay.off("authed", authedHandler);
    relay.on("notice", noticeHandler);
    relay.on("connect", connectHandler);
    relay.on("ready", readyHandler);
    relay.on("disconnect", disconnectHandler);
    relay.on("flapping", flappingHandler);
    relay.on("auth", authHandler);
    relay.on("authed", authedHandler);
    relay.on("delayed-connect", (delay) => {
      if (this.ndk.cacheAdapter?.updateRelayStatus) {
        this.ndk.cacheAdapter.updateRelayStatus(relay.url, {
          dontConnectBefore: Date.now() + delay
        });
      }
    });
    this._relays.set(relayUrl, relay);
    if (connect) this.autoConnectRelays.add(relayUrl);
    if (connect && this.status === "active") {
      this.emit("relay:connecting", relay);
      relay.connect(void 0, reconnect).catch((e) => {
        this.debug(`Failed to connect to relay ${relayUrl}`, e);
      });
    }
  }
  /**
   * Removes a relay from the pool.
   * @param relayUrl - The URL of the relay to remove.
   * @returns {boolean} True if the relay was removed, false if it was not found.
   */
  removeRelay(relayUrl) {
    const relay = this.relays.get(relayUrl);
    if (relay) {
      relay.disconnect();
      this.relays.delete(relayUrl);
      this.autoConnectRelays.delete(relayUrl);
      this.emit("relay:disconnect", relay);
      return true;
    }
    const existingTimer = this.temporaryRelayTimers.get(relayUrl);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.temporaryRelayTimers.delete(relayUrl);
    }
    return false;
  }
  /**
   * Checks whether a relay is already connected in the pool.
   */
  isRelayConnected(url) {
    const normalizedUrl = normalizeRelayUrl(url);
    const relay = this.relays.get(normalizedUrl);
    if (!relay) return false;
    return relay.status === 5;
  }
  /**
   * Fetches a relay from the pool, or creates a new one if it does not exist.
   *
   * New relays will be attempted to be connected.
   */
  getRelay(url, connect = true, temporary = false, filters) {
    let relay = this.relays.get(normalizeRelayUrl(url));
    if (!relay) {
      relay = new NDKRelay(url, void 0, this.ndk);
      relay.connectivity.netDebug = this.ndk.netDebug;
      if (temporary) {
        this.useTemporaryRelay(relay, 3e4, filters);
      } else {
        this.addRelay(relay, connect);
      }
    }
    return relay;
  }
  handleRelayConnect(relayUrl) {
    const relay = this.relays.get(relayUrl);
    if (!relay) {
      console.error("NDK BUG: relay not found in pool", { relayUrl });
      return;
    }
    this.emit("relay:connect", relay);
    if (this.stats().connected === this.relays.size) {
      this.emit("connect");
    }
  }
  handleRelayReady(relay) {
    this.emit("relay:ready", relay);
  }
  /**
   * Attempts to establish a connection to each relay in the pool.
   *
   * @async
   * @param {number} [timeoutMs] - Optional timeout in milliseconds for each connection attempt.
   * @returns {Promise<void>} A promise that resolves when all connection attempts have completed.
   * @throws {Error} If any of the connection attempts result in an error or timeout.
   */
  async connect(timeoutMs) {
    this.status = "active";
    this.debug(`Connecting to ${this.relays.size} relays${timeoutMs ? `, timeout ${timeoutMs}ms` : ""}...`);
    const relaysToConnect = Array.from(this.autoConnectRelays.keys()).map((url) => this.relays.get(url)).filter((relay) => !!relay);
    for (const relay of relaysToConnect) {
      if (relay.status !== 5 && relay.status !== 4) {
        this.emit("relay:connecting", relay);
        relay.connect().catch((e) => {
          this.debug(`Failed to connect to relay ${relay.url}: ${e ?? "No reason specified"}`);
        });
      }
    }
    const allConnected = () => relaysToConnect.every(
      (r) => r.status === 5
      /* CONNECTED */
    );
    const allConnectedPromise = new Promise((resolve) => {
      if (allConnected()) {
        resolve();
        return;
      }
      const listeners = [];
      for (const relay of relaysToConnect) {
        const handler = () => {
          if (allConnected()) {
            for (let i2 = 0; i2 < relaysToConnect.length; i2++) {
              relaysToConnect[i2].off("connect", listeners[i2]);
            }
            resolve();
          }
        };
        listeners.push(handler);
        relay.on("connect", handler);
      }
    });
    const timeoutPromise = typeof timeoutMs === "number" ? new Promise((resolve) => setTimeout(resolve, timeoutMs)) : new Promise(() => {
    });
    await Promise.race([allConnectedPromise, timeoutPromise]);
  }
  checkOnFlappingRelays() {
    const flappingRelaysCount = this.flappingRelays.size;
    const totalRelays = this.relays.size;
    if (flappingRelaysCount / totalRelays >= 0.8) {
      for (const relayUrl of this.flappingRelays) {
        this.backoffTimes.set(relayUrl, 0);
      }
    }
  }
  /**
   * Records when a relay disconnects to detect system-wide events
   */
  recordDisconnection(relay) {
    const now2 = Date.now();
    this.disconnectionTimes.set(relay.url, now2);
    for (const [url, time] of this.disconnectionTimes.entries()) {
      if (now2 - time > 1e4) {
        this.disconnectionTimes.delete(url);
      }
    }
    this.checkForSystemWideDisconnection();
  }
  /**
   * Checks if multiple relays disconnected simultaneously, indicating a system event
   */
  checkForSystemWideDisconnection() {
    const now2 = Date.now();
    const recentDisconnections = [];
    for (const time of this.disconnectionTimes.values()) {
      if (now2 - time < 5e3) {
        recentDisconnections.push(time);
      }
    }
    if (recentDisconnections.length > this.relays.size / 2 && this.relays.size > 1) {
      this.debug(
        `System-wide disconnection detected: ${recentDisconnections.length}/${this.relays.size} relays disconnected`
      );
      this.handleSystemWideReconnection();
    }
  }
  /**
   * Handles system-wide reconnection (e.g., after sleep/wake or network change)
   */
  handleSystemWideReconnection() {
    if (this.systemEventDetector) {
      this.debug("System-wide reconnection already in progress, skipping");
      return;
    }
    this.debug("Initiating system-wide reconnection with reset backoff");
    this.systemEventDetector = setTimeout(() => {
      this.systemEventDetector = void 0;
    }, 1e4);
    for (const relay of this.relays.values()) {
      if (relay.connectivity) {
        relay.connectivity.resetReconnectionState();
        if (relay.status !== 5 && relay.status !== 4) {
          relay.connect().catch((e) => {
            this.debug(`Failed to reconnect relay ${relay.url} after system event: ${e}`);
          });
        }
      }
    }
    this.disconnectionTimes.clear();
  }
  handleFlapping(relay) {
    this.debug(`Relay ${relay.url} is flapping`);
    let currentBackoff = this.backoffTimes.get(relay.url) || 5e3;
    currentBackoff = currentBackoff * 2;
    this.backoffTimes.set(relay.url, currentBackoff);
    this.debug(`Backoff time for ${relay.url} is ${currentBackoff}ms`);
    setTimeout(() => {
      this.debug(`Attempting to reconnect to ${relay.url}`);
      this.emit("relay:connecting", relay);
      relay.connect();
      this.checkOnFlappingRelays();
    }, currentBackoff);
    relay.disconnect();
    this.emit("flapping", relay);
  }
  size() {
    return this.relays.size;
  }
  /**
   * Returns the status of each relay in the pool.
   * @returns {NDKPoolStats} An object containing the number of relays in each status.
   */
  stats() {
    const stats = {
      total: 0,
      connected: 0,
      disconnected: 0,
      connecting: 0
    };
    for (const relay of this.relays.values()) {
      stats.total++;
      if (relay.status === 5) {
        stats.connected++;
      } else if (relay.status === 1) {
        stats.disconnected++;
      } else if (relay.status === 4) {
        stats.connecting++;
      }
    }
    return stats;
  }
  connectedRelays() {
    return Array.from(this.relays.values()).filter(
      (relay) => relay.status >= 5
      /* CONNECTED */
    );
  }
  permanentAndConnectedRelays() {
    return Array.from(this.relays.values()).filter(
      (relay) => relay.status >= 5 && !this.temporaryRelayTimers.has(relay.url)
    );
  }
  /**
   * Get a list of all relay urls in the pool.
   */
  urls() {
    return Array.from(this.relays.keys());
  }
};
var NDKAppSettings = class _NDKAppSettings extends NDKEvent {
  appName;
  settings = {};
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30078;
    this.dTag ??= this.appName;
    if (this.content.length > 0) {
      try {
        this.settings = JSON.parse(this.content);
      } catch (error) {
        console.error("Error parsing app settings", error);
      }
    }
  }
  static from(event) {
    return new _NDKAppSettings(event.ndk, event);
  }
  /**
   * Set a value for a given key.
   *
   * @param key
   * @param value
   */
  set(key, value) {
    this.settings[key] = value;
  }
  /**
   * Get a value for a given key.
   *
   * @param key
   * @returns
   */
  get(key) {
    return this.settings[key];
  }
  async publishReplaceable(relaySet, timeoutMs, requiredRelayCount) {
    this.content = JSON.stringify(this.settings);
    return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount);
  }
};
function isEphemeralKind2(kind) {
  return kind >= 2e4 && kind < 3e4;
}
function filterEphemeralKindsFromFilter(filter) {
  if (!filter.kinds || filter.kinds.length === 0) {
    return filter;
  }
  const nonEphemeralKinds = filter.kinds.filter((kind) => !isEphemeralKind2(kind));
  if (nonEphemeralKinds.length === 0) {
    return null;
  }
  if (nonEphemeralKinds.length === filter.kinds.length) {
    return filter;
  }
  return {
    ...filter,
    kinds: nonEphemeralKinds
  };
}
function filterForCache(subscription) {
  let filters = subscription.filters;
  if (subscription.cacheUnconstrainFilter) {
    filters = filters.map((filter) => {
      const filterCopy = { ...filter };
      for (const key of subscription.cacheUnconstrainFilter) {
        delete filterCopy[key];
      }
      return filterCopy;
    });
    filters = filters.filter((filter) => Object.keys(filter).length > 0);
  }
  const processedFilters = [];
  for (const filter of filters) {
    const processed = filterEphemeralKindsFromFilter(filter);
    if (processed !== null) {
      processedFilters.push(processed);
    }
  }
  return processedFilters;
}
var NDKDvmJobFeedbackStatus = /* @__PURE__ */ ((NDKDvmJobFeedbackStatus2) => {
  NDKDvmJobFeedbackStatus2["Processing"] = "processing";
  NDKDvmJobFeedbackStatus2["Success"] = "success";
  NDKDvmJobFeedbackStatus2["Scheduled"] = "scheduled";
  NDKDvmJobFeedbackStatus2["PayReq"] = "payment_required";
  return NDKDvmJobFeedbackStatus2;
})(NDKDvmJobFeedbackStatus || {});
var NDKDVMJobFeedback = class _NDKDVMJobFeedback extends NDKEvent {
  static kind = 7e3;
  static kinds = [
    7e3
    /* DVMJobFeedback */
  ];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 7e3;
  }
  static async from(event) {
    const e = new _NDKDVMJobFeedback(event.ndk, event.rawEvent());
    if (e.encrypted) await e.dvmDecrypt();
    return e;
  }
  get status() {
    return this.tagValue("status");
  }
  set status(status) {
    this.removeTag("status");
    if (status !== void 0) {
      this.tags.push(["status", status]);
    }
  }
  get encrypted() {
    return !!this.getMatchingTags("encrypted")[0];
  }
  async dvmDecrypt() {
    await this.decrypt();
    const decryptedContent = JSON.parse(this.content);
    this.tags.push(...decryptedContent);
  }
};
var NDKDVMRequest = class _NDKDVMRequest extends NDKEvent {
  static kind = 5e3;
  static kinds = [
    5e3,
    5001,
    5002,
    5050,
    5100,
    5250,
    5300,
    5301,
    5900,
    5905
    /* DVMEventSchedule */
  ];
  static from(event) {
    return new _NDKDVMRequest(event.ndk, event.rawEvent());
  }
  set bid(msatAmount) {
    if (msatAmount === void 0) {
      this.removeTag("bid");
    } else {
      this.tags.push(["bid", msatAmount.toString()]);
    }
  }
  get bid() {
    const v = this.tagValue("bid");
    if (v === void 0) return void 0;
    return Number.parseInt(v);
  }
  /**
   * Adds a new input to the job
   * @param args The arguments to the input
   */
  addInput(...args) {
    this.tags.push(["i", ...args]);
  }
  /**
   * Adds a new parameter to the job
   */
  addParam(...args) {
    this.tags.push(["param", ...args]);
  }
  set output(output) {
    if (output === void 0) {
      this.removeTag("output");
    } else {
      if (typeof output === "string") output = [output];
      this.tags.push(["output", ...output]);
    }
  }
  get output() {
    const outputTag = this.getMatchingTags("output")[0];
    return outputTag ? outputTag.slice(1) : void 0;
  }
  get params() {
    const paramTags = this.getMatchingTags("param");
    return paramTags.map((t) => t.slice(1));
  }
  getParam(name) {
    const paramTag = this.getMatchingTags("param").find((t) => t[1] === name);
    return paramTag ? paramTag[2] : void 0;
  }
  createFeedback(status) {
    const feedback = new NDKDVMJobFeedback(this.ndk);
    feedback.tag(this, "job");
    feedback.status = status;
    return feedback;
  }
  /**
   * Enables job encryption for this event
   * @param dvm DVM that will receive the event
   * @param signer Signer to use for encryption
   */
  async encryption(dvm, signer) {
    const dvmTags = ["i", "param", "output", "relays", "bid"];
    const tags = this.tags.filter((t) => dvmTags.includes(t[0]));
    this.tags = this.tags.filter((t) => !dvmTags.includes(t[0]));
    this.content = JSON.stringify(tags);
    this.tag(dvm);
    this.tags.push(["encrypted"]);
    await this.encrypt(dvm, signer);
  }
  /**
   * Sets the DVM that will receive the event
   */
  set dvm(dvm) {
    this.removeTag("p");
    if (dvm) this.tag(dvm);
  }
};
var NDKTranscriptionDVM = class _NDKTranscriptionDVM extends NDKDVMRequest {
  constructor(ndk, event) {
    super(ndk, event);
    this.kind = 5e3;
  }
  static from(event) {
    return new _NDKTranscriptionDVM(event.ndk, event.rawEvent());
  }
  /**
   * Returns the original source of the transcription
   */
  get url() {
    const inputTags = this.getMatchingTags("i");
    if (inputTags.length !== 1) {
      return void 0;
    }
    return inputTags[0][1];
  }
  /**
   * Getter for the title tag
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the title tag
   */
  set title(value) {
    this.removeTag("title");
    if (value) {
      this.tags.push(["title", value]);
    }
  }
  /**
   * Getter for the image tag
   */
  get image() {
    return this.tagValue("image");
  }
  /**
   * Setter for the image tag
   */
  set image(value) {
    this.removeTag("image");
    if (value) {
      this.tags.push(["image", value]);
    }
  }
};
var NDKDVMJobResult = class _NDKDVMJobResult extends NDKEvent {
  static kind = 6e3;
  static kinds = [
    6e3,
    // DVMReqTextExtraction result
    6001,
    // DVMReqTextSummarization result
    6002,
    // DVMReqTextTranslation result
    6050,
    // DVMReqTextGeneration result
    6100,
    // DVMReqImageGeneration result
    6250,
    // DVMReqTextToSpeech result
    6300,
    // DVMReqDiscoveryNostrContent result
    6301,
    // DVMReqDiscoveryNostrPeople result
    6900,
    // DVMReqTimestamping result
    6905
    // DVMEventSchedule result
  ];
  static from(event) {
    return new _NDKDVMJobResult(event.ndk, event.rawEvent());
  }
  setAmount(msat, invoice) {
    this.removeTag("amount");
    const tag = ["amount", msat.toString()];
    if (invoice) tag.push(invoice);
    this.tags.push(tag);
  }
  set result(result) {
    if (result === void 0) {
      this.content = "";
    } else {
      this.content = result;
    }
  }
  get result() {
    if (this.content === "") {
      return void 0;
    }
    return this.content;
  }
  set status(status) {
    this.removeTag("status");
    if (status !== void 0) {
      this.tags.push(["status", status]);
    }
  }
  get status() {
    return this.tagValue("status");
  }
  get jobRequestId() {
    for (const eTag of this.getMatchingTags("e")) {
      if (eTag[2] === "job") return eTag[1];
    }
    if (this.jobRequest) return this.jobRequest.id;
    return this.tagValue("e");
  }
  set jobRequest(event) {
    this.removeTag("request");
    if (event) {
      this.kind = event.kind + 1e3;
      this.tags.push(["request", JSON.stringify(event.rawEvent())]);
      this.tag(event);
    }
  }
  get jobRequest() {
    const tag = this.tagValue("request");
    if (tag === void 0) {
      return void 0;
    }
    return new NDKEvent(this.ndk, JSON.parse(tag));
  }
};
function addRelays(event, relays) {
  const tags = [];
  if (!relays || relays.length === 0) {
    const poolRelays = event.ndk?.pool.relays;
    relays = poolRelays ? Object.keys(poolRelays) : void 0;
  }
  if (relays && relays.length > 0) tags.push(["relays", ...relays]);
  return tags;
}
async function dvmSchedule(events, dvm, relays, encrypted = true, waitForConfirmationForMs) {
  if (!Array.isArray(events)) {
    events = [events];
  }
  const ndk = events[0].ndk;
  if (!ndk) throw new Error("NDK not set");
  for (const event of events) {
    if (!event.sig) throw new Error("Event not signed");
    if (!event.created_at) throw new Error("Event has no date");
    if (!dvm) throw new Error("No DVM specified");
    if (event.created_at <= Date.now() / 1e3) throw new Error("Event needs to be in the future");
  }
  const scheduleEvent = new NDKDVMRequest(ndk, {
    kind: 5905
    /* DVMEventSchedule */
  });
  for (const event of events) {
    scheduleEvent.addInput(JSON.stringify(event.rawEvent()), "text");
  }
  scheduleEvent.tags.push(...addRelays(events[0], relays));
  if (encrypted) {
    await scheduleEvent.encryption(dvm);
  } else {
    scheduleEvent.dvm = dvm;
  }
  await scheduleEvent.sign();
  let res;
  const schedulePromise = new Promise((resolve, reject) => {
    if (waitForConfirmationForMs) {
      res = ndk.subscribe(
        {
          kinds: [
            5905 + 1e3,
            7e3
            /* DVMJobFeedback */
          ],
          ...scheduleEvent.filter()
        },
        {
          groupable: false,
          closeOnEose: false,
          onEvent: async (e) => {
            res?.stop();
            if (e.kind === 7e3) {
              const feedback = await NDKDVMJobFeedback.from(e);
              if (feedback.status === "error") {
                const statusTag = feedback.getMatchingTags("status");
                reject(statusTag?.[2] ?? feedback);
              } else {
                resolve(feedback);
              }
            }
            resolve(e);
          }
        }
      );
    }
    scheduleEvent.publish().then(() => {
      if (!waitForConfirmationForMs) resolve(void 0);
    });
  });
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      res?.stop();
      reject("Timeout waiting for an answer from the DVM");
    }, waitForConfirmationForMs);
  });
  return new Promise((resolve, reject) => {
    if (waitForConfirmationForMs) {
      Promise.race([timeoutPromise, schedulePromise]).then((e) => {
        resolve(e);
      }).catch(reject);
    } else {
      schedulePromise.then(resolve);
    }
  });
}
var NDKCashuMintList = class _NDKCashuMintList extends NDKEvent {
  static kind = 10019;
  static kinds = [
    10019
    /* CashuMintList */
  ];
  _p2pk;
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 10019;
  }
  static from(event) {
    return new _NDKCashuMintList(event.ndk, event);
  }
  set relays(urls) {
    this.tags = this.tags.filter((t) => t[0] !== "relay");
    for (const url of urls) {
      this.tags.push(["relay", url]);
    }
  }
  get relays() {
    const r = [];
    for (const tag of this.tags) {
      if (tag[0] === "relay") {
        r.push(tag[1]);
      }
    }
    return r;
  }
  set mints(urls) {
    this.tags = this.tags.filter((t) => t[0] !== "mint");
    for (const url of urls) {
      this.tags.push(["mint", url]);
    }
  }
  get mints() {
    const r = [];
    for (const tag of this.tags) {
      if (tag[0] === "mint") {
        r.push(tag[1]);
      }
    }
    return Array.from(new Set(r));
  }
  get p2pk() {
    if (this._p2pk) {
      return this._p2pk;
    }
    this._p2pk = this.tagValue("pubkey") ?? this.pubkey;
    return this._p2pk;
  }
  set p2pk(pubkey) {
    this._p2pk = pubkey;
    this.removeTag("pubkey");
    if (pubkey) {
      this.tags.push(["pubkey", pubkey]);
    }
  }
  get relaySet() {
    return NDKRelaySet.fromRelayUrls(this.relays, this.ndk);
  }
};
var NDKArticle = class _NDKArticle extends NDKEvent {
  static kind = 30023;
  static kinds = [
    30023
    /* Article */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30023;
  }
  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from(event) {
    return new _NDKArticle(event.ndk, event);
  }
  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title(title) {
    this.removeTag("title");
    if (title) this.tags.push(["title", title]);
  }
  /**
   * Getter for the article image.
   *
   * @returns {string | undefined} - The article image if available, otherwise undefined.
   */
  get image() {
    return this.tagValue("image");
  }
  /**
   * Setter for the article image.
   *
   * @param {string | undefined} image - The image to set for the article.
   */
  set image(image) {
    this.removeTag("image");
    if (image) this.tags.push(["image", image]);
  }
  get summary() {
    return this.tagValue("summary");
  }
  set summary(summary) {
    this.removeTag("summary");
    if (summary) this.tags.push(["summary", summary]);
  }
  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      let val = Number.parseInt(tag);
      if (val > 1e12) {
        val = Math.floor(val / 1e3);
      }
      return val;
    }
    return void 0;
  }
  /**
   * Setter for the article's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
   */
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== void 0) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
  /**
   * Getter for the article's URL.
   *
   * @returns {string | undefined} - The article's URL if available, otherwise undefined.
   */
  get url() {
    return this.tagValue("url");
  }
  /**
   * Setter for the article's URL.
   *
   * @param {string | undefined} url - The URL to set for the article.
   */
  set url(url) {
    if (url) {
      this.tags.push(["url", url]);
    } else {
      this.removeTag("url");
    }
  }
};
var NDKBlossomList = class _NDKBlossomList extends NDKEvent {
  static kind = 10063;
  static kinds = [
    10063
    /* BlossomList */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10063;
  }
  static from(ndkEvent) {
    return new _NDKBlossomList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  /**
   * Returns all Blossom servers in the list
   */
  get servers() {
    return this.tags.filter((tag) => tag[0] === "server").map((tag) => tag[1]);
  }
  /**
   * Sets the list of Blossom servers
   */
  set servers(servers) {
    this.tags = this.tags.filter((tag) => tag[0] !== "server");
    for (const server of servers) {
      this.tags.push(["server", server]);
    }
  }
  /**
   * Returns the default Blossom server (first in the list)
   */
  get default() {
    const servers = this.servers;
    return servers.length > 0 ? servers[0] : void 0;
  }
  /**
   * Sets the default Blossom server by moving it to the beginning of the list
   */
  set default(server) {
    if (!server) return;
    const currentServers = this.servers;
    const filteredServers = currentServers.filter((s) => s !== server);
    this.servers = [server, ...filteredServers];
  }
  /**
   * Adds a server to the list if it doesn't already exist
   */
  addServer(server) {
    if (!server) return;
    const currentServers = this.servers;
    if (!currentServers.includes(server)) {
      this.servers = [...currentServers, server];
    }
  }
  /**
   * Removes a server from the list
   */
  removeServer(server) {
    if (!server) return;
    const currentServers = this.servers;
    this.servers = currentServers.filter((s) => s !== server);
  }
};
var NDKFedimintMint = class _NDKFedimintMint extends NDKEvent {
  static kind = 38173;
  static kinds = [
    38173
    /* FedimintMintAnnouncement */
  ];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38173;
  }
  static async from(event) {
    const mint = new _NDKFedimintMint(event.ndk, event);
    return mint;
  }
  /**
   * The federation ID
   */
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value) this.tags.push(["d", value]);
  }
  /**
   * Invite codes (multiple allowed)
   */
  get inviteCodes() {
    return this.getMatchingTags("u").map((t) => t[1]);
  }
  set inviteCodes(values) {
    this.removeTag("u");
    for (const value of values) {
      this.tags.push(["u", value]);
    }
  }
  /**
   * Supported modules
   */
  get modules() {
    return this.getMatchingTags("modules").map((t) => t[1]);
  }
  set modules(values) {
    this.removeTag("modules");
    for (const value of values) {
      this.tags.push(["modules", value]);
    }
  }
  /**
   * Network (mainnet/testnet/signet/regtest)
   */
  get network() {
    return this.tagValue("n");
  }
  set network(value) {
    this.removeTag("n");
    if (value) this.tags.push(["n", value]);
  }
  /**
   * Optional metadata
   */
  get metadata() {
    if (!this.content) return void 0;
    try {
      return JSON.parse(this.content);
    } catch {
      return void 0;
    }
  }
  set metadata(value) {
    if (value) {
      this.content = JSON.stringify(value);
    } else {
      this.content = "";
    }
  }
};
var NDKCashuMintAnnouncement = class _NDKCashuMintAnnouncement extends NDKEvent {
  static kind = 38172;
  static kinds = [
    38172
    /* CashuMintAnnouncement */
  ];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38172;
  }
  static async from(event) {
    const mint = new _NDKCashuMintAnnouncement(event.ndk, event);
    return mint;
  }
  /**
   * The mint's identifier (pubkey)
   */
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value) this.tags.push(["d", value]);
  }
  /**
   * The mint URL
   */
  get url() {
    return this.tagValue("u");
  }
  set url(value) {
    this.removeTag("u");
    if (value) this.tags.push(["u", value]);
  }
  /**
   * Supported NUT protocols
   */
  get nuts() {
    return this.getMatchingTags("nuts").map((t) => t[1]);
  }
  set nuts(values) {
    this.removeTag("nuts");
    for (const value of values) {
      this.tags.push(["nuts", value]);
    }
  }
  /**
   * Network (mainnet/testnet/signet/regtest)
   */
  get network() {
    return this.tagValue("n");
  }
  set network(value) {
    this.removeTag("n");
    if (value) this.tags.push(["n", value]);
  }
  /**
   * Optional metadata
   */
  get metadata() {
    if (!this.content) return void 0;
    try {
      return JSON.parse(this.content);
    } catch {
      return void 0;
    }
  }
  set metadata(value) {
    if (value) {
      this.content = JSON.stringify(value);
    } else {
      this.content = "";
    }
  }
};
var NDKMintRecommendation = class _NDKMintRecommendation extends NDKEvent {
  static kind = 38e3;
  static kinds = [
    38e3
    /* EcashMintRecommendation */
  ];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38e3;
  }
  static async from(event) {
    const recommendation = new _NDKMintRecommendation(event.ndk, event);
    return recommendation;
  }
  /**
   * Event kind being recommended (38173 for Fedimint or 38172 for Cashu)
   */
  get recommendedKind() {
    const value = this.tagValue("k");
    return value ? Number(value) : void 0;
  }
  set recommendedKind(value) {
    this.removeTag("k");
    if (value) this.tags.push(["k", value.toString()]);
  }
  /**
   * Identifier for the recommended mint event
   */
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value) this.tags.push(["d", value]);
  }
  /**
   * Mint connection URLs/invite codes (multiple allowed)
   */
  get urls() {
    return this.getMatchingTags("u").map((t) => t[1]);
  }
  set urls(values) {
    this.removeTag("u");
    for (const value of values) {
      this.tags.push(["u", value]);
    }
  }
  /**
   * Pointers to specific mint events
   * Returns array of {kind, identifier, relay} objects
   */
  get mintEventPointers() {
    return this.getMatchingTags("a").map((t) => ({
      kind: Number(t[1].split(":")[0]),
      identifier: t[1].split(":")[2],
      relay: t[2]
    }));
  }
  /**
   * Add a pointer to a specific mint event
   */
  addMintEventPointer(kind, pubkey, identifier, relay) {
    const aTag = [`a`, `${kind}:${pubkey}:${identifier}`];
    if (relay) aTag.push(relay);
    this.tags.push(aTag);
  }
  /**
   * Review/recommendation text
   */
  get review() {
    return this.content;
  }
  set review(value) {
    this.content = value;
  }
};
var NDKClassified = class _NDKClassified extends NDKEvent {
  static kind = 30402;
  static kinds = [
    30402
    /* Classified */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30402;
  }
  /**
   * Creates a NDKClassified from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKClassified from.
   * @returns NDKClassified
   */
  static from(event) {
    return new _NDKClassified(event.ndk, event);
  }
  /**
   * Getter for the classified title.
   *
   * @returns {string | undefined} - The classified title if available, otherwise undefined.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the classified title.
   *
   * @param {string | undefined} title - The title to set for the classified.
   */
  set title(title) {
    this.removeTag("title");
    if (title) this.tags.push(["title", title]);
  }
  /**
   * Getter for the classified summary.
   *
   * @returns {string | undefined} - The classified summary if available, otherwise undefined.
   */
  get summary() {
    return this.tagValue("summary");
  }
  /**
   * Setter for the classified summary.
   *
   * @param {string | undefined} summary - The summary to set for the classified.
   */
  set summary(summary) {
    this.removeTag("summary");
    if (summary) this.tags.push(["summary", summary]);
  }
  /**
   * Getter for the classified's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the classified was published or undefined.
   */
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return Number.parseInt(tag);
    }
    return void 0;
  }
  /**
   * Setter for the classified's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the classified's publication date.
   */
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== void 0) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  /**
   * Getter for the classified location.
   *
   * @returns {string | undefined} - The classified location if available, otherwise undefined.
   */
  get location() {
    return this.tagValue("location");
  }
  /**
   * Setter for the classified location.
   *
   * @param {string | undefined} location - The location to set for the classified.
   */
  set location(location) {
    this.removeTag("location");
    if (location) this.tags.push(["location", location]);
  }
  /**
   * Getter for the classified price.
   *
   * @returns {NDKClassifiedPriceTag | undefined} - The classified price if available, otherwise undefined.
   */
  get price() {
    const priceTag = this.tags.find((tag) => tag[0] === "price");
    if (priceTag) {
      return {
        amount: Number.parseFloat(priceTag[1]),
        currency: priceTag[2],
        frequency: priceTag[3]
      };
    }
    return void 0;
  }
  /**
   * Setter for the classified price.
   *
   * @param price - The price to set for the classified.
   */
  set price(priceTag) {
    if (typeof priceTag === "string") {
      priceTag = {
        amount: Number.parseFloat(priceTag)
      };
    }
    if (priceTag?.amount) {
      const tag = ["price", priceTag.amount.toString()];
      if (priceTag.currency) tag.push(priceTag.currency);
      if (priceTag.frequency) tag.push(priceTag.frequency);
      this.tags.push(tag);
    } else {
      this.removeTag("price");
    }
  }
  /**
   * Generates content tags for the classified.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
};
var NDKDraft = class _NDKDraft extends NDKEvent {
  _event;
  static kind = 31234;
  static kinds = [
    31234,
    1234
    /* DraftCheckpoint */
  ];
  /**
   * Can be used to include a different pubkey as part of the draft.
   * This is useful when we want to make the draft a proposal for a different user to publish.
   */
  counterparty;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 31234;
  }
  static from(event) {
    return new _NDKDraft(event.ndk, event);
  }
  /**
   * Sets an identifier (i.e. d-tag)
   */
  set identifier(id) {
    this.removeTag("d");
    this.tags.push(["d", id]);
  }
  get identifier() {
    return this.dTag;
  }
  /**
   * Event that is to be saved.
   */
  set event(e) {
    if (!(e instanceof NDKEvent)) this._event = new NDKEvent(void 0, e);
    else this._event = e;
    this.prepareEvent();
  }
  /**
   * Marks the event as a checkpoint for another draft event.
   */
  set checkpoint(parent) {
    if (parent) {
      this.tags.push(parent.tagReference());
      this.kind = 1234;
    } else {
      this.removeTag("a");
      this.kind = 31234;
    }
  }
  get isCheckpoint() {
    return this.kind === 1234;
  }
  get isProposal() {
    const pTag = this.tagValue("p");
    return !!pTag && pTag !== this.pubkey;
  }
  /**
   * Gets the event.
   * @param param0
   * @returns NDKEvent of the draft event or null if the draft event has been deleted (emptied).
   */
  async getEvent(signer) {
    if (this._event) return this._event;
    signer ??= this.ndk?.signer;
    if (!signer) throw new Error("No signer available");
    if (this.content && this.content.length > 0) {
      try {
        const ownPubkey = signer.pubkey;
        const pubkeys = [this.tagValue("p"), this.pubkey].filter(Boolean);
        const counterpartyPubkey = pubkeys.find((pubkey) => pubkey !== ownPubkey);
        let user;
        user = new NDKUser({ pubkey: counterpartyPubkey ?? ownPubkey });
        await this.decrypt(user, signer);
        const payload = JSON.parse(this.content);
        this._event = await wrapEvent3(new NDKEvent(this.ndk, payload));
        return this._event;
      } catch (e) {
        console.error(e);
        return void 0;
      }
    } else {
      return null;
    }
  }
  prepareEvent() {
    if (!this._event) throw new Error("No event has been provided");
    this.removeTag("k");
    if (this._event.kind) this.tags.push(["k", this._event.kind.toString()]);
    this.content = JSON.stringify(this._event.rawEvent());
  }
  /**
   * Generates draft event.
   *
   * @param signer: Optional signer to encrypt with
   * @param publish: Whether to publish, optionally specifying relaySet to publish to
   */
  async save({ signer, publish, relaySet }) {
    signer ??= this.ndk?.signer;
    if (!signer) throw new Error("No signer available");
    const user = this.counterparty || await signer.user();
    await this.encrypt(user, signer);
    if (this.counterparty) {
      const pubkey = this.counterparty.pubkey;
      this.removeTag("p");
      this.tags.push(["p", pubkey]);
    }
    if (publish === false) return;
    return this.publishReplaceable(relaySet);
  }
};
function mapImetaTag(tag) {
  const data = {};
  if (tag.length === 2) {
    const parts = tag[1].split(" ");
    for (let i2 = 0; i2 < parts.length; i2 += 2) {
      const key = parts[i2];
      const value = parts[i2 + 1];
      if (key === "fallback") {
        if (!data.fallback) data.fallback = [];
        data.fallback.push(value);
      } else {
        data[key] = value;
      }
    }
    return data;
  }
  const tags = tag.slice(1);
  for (const val of tags) {
    const parts = val.split(" ");
    const key = parts[0];
    const value = parts.slice(1).join(" ");
    if (key === "fallback") {
      if (!data.fallback) data.fallback = [];
      data.fallback.push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}
function imetaTagToTag(imeta) {
  const tag = ["imeta"];
  for (const [key, value] of Object.entries(imeta)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        tag.push(`${key} ${v}`);
      }
    } else if (value) {
      tag.push(`${key} ${value}`);
    }
  }
  return tag;
}
var NDKFollowPack = class _NDKFollowPack extends NDKEvent {
  static kind = 39089;
  static kinds = [
    39089,
    39092
    /* MediaFollowPack */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39089;
  }
  /**
   * Converts a generic NDKEvent to an NDKFollowPack.
   */
  static from(ndkEvent) {
    return new _NDKFollowPack(ndkEvent.ndk, ndkEvent);
  }
  /**
   * Gets the title from the tags.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Sets the title tag.
   */
  set title(value) {
    this.removeTag("title");
    if (value) this.tags.push(["title", value]);
  }
  /**
   * Gets the image URL from the tags.
   */
  /**
   * Gets the image URL from the tags.
   * Looks for an imeta tag first (returns its url), then falls back to the image tag.
   */
  get image() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (imetaTag) {
      const imeta = mapImetaTag(imetaTag);
      if (imeta.url) return imeta.url;
    }
    return this.tagValue("image");
  }
  /**
   * Sets the image URL tag.
   */
  /**
   * Sets the image tag.
   * Accepts a string (URL) or an NDKImetaTag.
   * If given an NDKImetaTag, sets both the imeta tag and the image tag (using the url).
   * If undefined, removes both tags.
   */
  set image(value) {
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta" && tag[0] !== "image");
    if (typeof value === "string") {
      if (value !== void 0) {
        this.tags.push(["image", value]);
      }
    } else if (value && typeof value === "object") {
      this.tags.push(imetaTagToTag(value));
      if (value.url) {
        this.tags.push(["image", value.url]);
      }
    }
  }
  /**
   * Gets all pubkeys from p tags.
   */
  get pubkeys() {
    return Array.from(
      new Set(this.tags.filter((tag) => tag[0] === "p" && tag[1] && isValidPubkey(tag[1])).map((tag) => tag[1]))
    );
  }
  /**
   * Sets the pubkeys (replaces all p tags).
   */
  set pubkeys(pubkeys) {
    this.tags = this.tags.filter((tag) => tag[0] !== "p");
    for (const pubkey of pubkeys) {
      this.tags.push(["p", pubkey]);
    }
  }
  /**
   * Gets the description from the tags.
   */
  get description() {
    return this.tagValue("description");
  }
  /**
   * Sets the description tag.
   */
  set description(value) {
    this.removeTag("description");
    if (value) this.tags.push(["description", value]);
  }
};
var NDKHighlight = class _NDKHighlight extends NDKEvent {
  _article;
  static kind = 9802;
  static kinds = [
    9802
    /* Highlight */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 9802;
  }
  static from(event) {
    return new _NDKHighlight(event.ndk, event);
  }
  get url() {
    return this.tagValue("r");
  }
  /**
   * Context tag.
   */
  set context(context) {
    if (context === void 0) {
      this.tags = this.tags.filter(([tag, _value]) => tag !== "context");
    } else {
      this.tags = this.tags.filter(([tag, _value]) => tag !== "context");
      this.tags.push(["context", context]);
    }
  }
  get context() {
    return this.tags.find(([tag, _value]) => tag === "context")?.[1] ?? void 0;
  }
  /**
   * Will return the article URL or NDKEvent if they have already been
   * set (it won't attempt to load remote events)
   */
  get article() {
    return this._article;
  }
  /**
   * Article the highlight is coming from.
   *
   * @param article Article URL or NDKEvent.
   */
  set article(article) {
    this._article = article;
    if (typeof article === "string") {
      this.tags.push(["r", article]);
    } else {
      this.tag(article);
    }
  }
  getArticleTag() {
    return this.getMatchingTags("a")[0] || this.getMatchingTags("e")[0] || this.getMatchingTags("r")[0];
  }
  async getArticle() {
    if (this._article !== void 0) return this._article;
    let taggedBech32;
    const articleTag = this.getArticleTag();
    if (!articleTag) return void 0;
    switch (articleTag[0]) {
      case "a": {
        const [kind, pubkey, identifier] = articleTag[1].split(":");
        taggedBech32 = nip19_exports.naddrEncode({
          kind: Number.parseInt(kind),
          pubkey,
          identifier
        });
        break;
      }
      case "e":
        taggedBech32 = nip19_exports.noteEncode(articleTag[1]);
        break;
      case "r":
        this._article = articleTag[1];
        break;
    }
    if (taggedBech32) {
      let a = await this.ndk?.fetchEvent(taggedBech32);
      if (a) {
        if (a.kind === 30023) {
          a = NDKArticle.from(a);
        }
        this._article = a;
      }
    }
    return this._article;
  }
};
var NDKImage = class _NDKImage extends NDKEvent {
  static kind = 20;
  static kinds = [
    20
    /* Image */
  ];
  _imetas;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 20;
  }
  /**
   * Creates a NDKImage from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKImage from.
   * @returns NDKImage
   */
  static from(event) {
    return new _NDKImage(event.ndk, event.rawEvent());
  }
  get isValid() {
    return this.imetas.length > 0;
  }
  get imetas() {
    if (this._imetas) return this._imetas;
    this._imetas = this.tags.filter((tag) => tag[0] === "imeta").map(mapImetaTag).filter((imeta) => !!imeta.url);
    return this._imetas;
  }
  set imetas(tags) {
    this._imetas = tags;
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
    this.tags.push(...tags.map(imetaTagToTag));
  }
};
var NDKList = class _NDKList extends NDKEvent {
  _encryptedTags;
  static kind = 30001;
  static kinds = [
    30001,
    10004,
    10050,
    10030,
    10015,
    10001,
    10002,
    10007,
    10006,
    10003,
    10012
    /* RelayFeedList */
  ];
  /**
   * Stores the number of bytes the content was before decryption
   * to expire the cache when the content changes.
   */
  encryptedTagsLength;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30001;
  }
  /**
   * Wrap a NDKEvent into a NDKList
   */
  static from(ndkEvent) {
    return new _NDKList(ndkEvent.ndk, ndkEvent);
  }
  /**
   * Returns the title of the list. Falls back on fetching the name tag value.
   */
  get title() {
    const titleTag = this.tagValue("title") || this.tagValue("name");
    if (titleTag) return titleTag;
    if (this.kind === 3) {
      return "Contacts";
    }
    if (this.kind === 1e4) {
      return "Mute";
    }
    if (this.kind === 10001) {
      return "Pinned Notes";
    }
    if (this.kind === 10002) {
      return "Relay Metadata";
    }
    if (this.kind === 10003) {
      return "Bookmarks";
    }
    if (this.kind === 10004) {
      return "Communities";
    }
    if (this.kind === 10005) {
      return "Public Chats";
    }
    if (this.kind === 10006) {
      return "Blocked Relays";
    }
    if (this.kind === 10007) {
      return "Search Relays";
    }
    if (this.kind === 10050) {
      return "Direct Message Receive Relays";
    }
    if (this.kind === 10012) {
      return "Relay Feeds";
    }
    if (this.kind === 10015) {
      return "Interests";
    }
    if (this.kind === 10030) {
      return "Emojis";
    }
    return this.tagValue("d");
  }
  /**
   * Sets the title of the list.
   */
  set title(title) {
    this.removeTag(["title", "name"]);
    if (title) this.tags.push(["title", title]);
  }
  /**
   * Returns the name of the list.
   * @deprecated Please use "title" instead.
   */
  get name() {
    return this.title;
  }
  /**
   * Sets the name of the list.
   * @deprecated Please use "title" instead. This method will use the `title` tag instead.
   */
  set name(name) {
    this.title = name;
  }
  /**
   * Returns the description of the list.
   */
  get description() {
    return this.tagValue("description");
  }
  /**
   * Sets the description of the list.
   */
  set description(name) {
    this.removeTag("description");
    if (name) this.tags.push(["description", name]);
  }
  /**
   * Returns the image of the list.
   */
  get image() {
    return this.tagValue("image");
  }
  /**
   * Sets the image of the list.
   */
  set image(name) {
    this.removeTag("image");
    if (name) this.tags.push(["image", name]);
  }
  isEncryptedTagsCacheValid() {
    return !!(this._encryptedTags && this.encryptedTagsLength === this.content.length);
  }
  /**
   * Returns the decrypted content of the list.
   */
  async encryptedTags(useCache = true) {
    if (useCache && this.isEncryptedTagsCacheValid()) return this._encryptedTags;
    if (!this.ndk) throw new Error("NDK instance not set");
    if (!this.ndk.signer) throw new Error("NDK signer not set");
    const user = await this.ndk.signer.user();
    try {
      if (this.content.length > 0) {
        try {
          const decryptedContent = await this.ndk.signer.decrypt(user, this.content);
          const a = JSON.parse(decryptedContent);
          if (a?.[0]) {
            this.encryptedTagsLength = this.content.length;
            return this._encryptedTags = a;
          }
          this.encryptedTagsLength = this.content.length;
          return this._encryptedTags = [];
        } catch (_e) {
        }
      }
    } catch (_e) {
    }
    return [];
  }
  /**
   * This method can be overriden to validate that a tag is valid for this list.
   *
   * (i.e. the NDKPersonList can validate that items are NDKUser instances)
   */
  validateTag(_tagValue) {
    return true;
  }
  getItems(type) {
    return this.tags.filter((tag) => tag[0] === type);
  }
  /**
   * Returns the unecrypted items in this list.
   */
  get items() {
    return this.tags.filter((t) => {
      return ![
        "d",
        "L",
        "l",
        "title",
        "name",
        "description",
        "published_at",
        "summary",
        "image",
        "thumb",
        "alt",
        "expiration",
        "subject",
        "client"
      ].includes(t[0]);
    });
  }
  /**
   * Adds a new item to the list.
   * @param relay Relay to add
   * @param mark Optional mark to add to the item
   * @param encrypted Whether to encrypt the item
   * @param position Where to add the item in the list (top or bottom)
   */
  async addItem(item, mark = void 0, encrypted = false, position = "bottom") {
    if (!this.ndk) throw new Error("NDK instance not set");
    if (!this.ndk.signer) throw new Error("NDK signer not set");
    let tags;
    if (item instanceof NDKEvent) {
      tags = [item.tagReference(mark)];
    } else if (item instanceof NDKUser) {
      tags = item.referenceTags();
    } else if (item instanceof NDKRelay) {
      tags = item.referenceTags();
    } else if (Array.isArray(item)) {
      tags = [item];
    } else {
      throw new Error("Invalid object type");
    }
    if (mark) tags[0].push(mark);
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      if (position === "top") currentList.unshift(...tags);
      else currentList.push(...tags);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      if (position === "top") this.tags.unshift(...tags);
      else this.tags.push(...tags);
    }
    this.created_at = Math.floor(Date.now() / 1e3);
    this.emit("change");
  }
  /**
   * Removes an item from the list from both the encrypted and unencrypted lists.
   * @param value value of item to remove from the list
   * @param publish whether to publish the change
   * @returns
   */
  async removeItemByValue(value, publish = true) {
    if (!this.ndk) throw new Error("NDK instance not set");
    if (!this.ndk.signer) throw new Error("NDK signer not set");
    const index = this.tags.findIndex((tag) => tag[1] === value);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    const user = await this.ndk.signer.user();
    const encryptedTags = await this.encryptedTags();
    const encryptedIndex = encryptedTags.findIndex((tag) => tag[1] === value);
    if (encryptedIndex >= 0) {
      encryptedTags.splice(encryptedIndex, 1);
      this._encryptedTags = encryptedTags;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(encryptedTags);
      await this.encrypt(user);
    }
    if (publish) {
      return this.publishReplaceable();
    }
    this.created_at = Math.floor(Date.now() / 1e3);
    this.emit("change");
  }
  /**
   * Removes an item from the list.
   *
   * @param index The index of the item to remove.
   * @param encrypted Whether to remove from the encrypted list or not.
   */
  async removeItem(index, encrypted) {
    if (!this.ndk) throw new Error("NDK instance not set");
    if (!this.ndk.signer) throw new Error("NDK signer not set");
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      currentList.splice(index, 1);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      this.tags.splice(index, 1);
    }
    this.created_at = Math.floor(Date.now() / 1e3);
    this.emit("change");
    return this;
  }
  has(item) {
    return this.items.some((tag) => tag[1] === item);
  }
  /**
   * Creates a filter that will result in fetching
   * the items of this list
   * @example
   * const list = new NDKList(...);
   * const filters = list.filterForItems();
   * const events = await ndk.fetchEvents(filters);
   */
  filterForItems() {
    const ids = /* @__PURE__ */ new Set();
    const nip33Queries = /* @__PURE__ */ new Map();
    const filters = [];
    for (const tag of this.items) {
      if (tag[0] === "e" && tag[1]) {
        ids.add(tag[1]);
      } else if (tag[0] === "a" && tag[1]) {
        const [kind, pubkey, dTag] = tag[1].split(":");
        if (!kind || !pubkey) continue;
        const key = `${kind}:${pubkey}`;
        const item = nip33Queries.get(key) || [];
        item.push(dTag || "");
        nip33Queries.set(key, item);
      }
    }
    if (ids.size > 0) {
      filters.push({ ids: Array.from(ids) });
    }
    if (nip33Queries.size > 0) {
      for (const [key, values] of nip33Queries.entries()) {
        const [kind, pubkey] = key.split(":");
        filters.push({
          kinds: [Number.parseInt(kind)],
          authors: [pubkey],
          "#d": values
        });
      }
    }
    return filters;
  }
};
var lists_default = NDKList;
var NDKAppHandlerEvent = class _NDKAppHandlerEvent extends NDKEvent {
  profile;
  static kind = 31990;
  static kinds = [
    31990
    /* AppHandler */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 31990;
  }
  static from(ndkEvent) {
    const event = new _NDKAppHandlerEvent(ndkEvent.ndk, ndkEvent.rawEvent());
    if (event.isValid) {
      return event;
    }
    return null;
  }
  get isValid() {
    const combinations = /* @__PURE__ */ new Map();
    const combinationFromTag = (tag) => [tag[0], tag[2]].join(":").toLowerCase();
    const tagsToInspect = ["web", "android", "ios"];
    for (const tag of this.tags) {
      if (tagsToInspect.includes(tag[0])) {
        const combination = combinationFromTag(tag);
        if (combinations.has(combination)) {
          if (combinations.get(combination) !== tag[1].toLowerCase()) {
            return false;
          }
        }
        combinations.set(combination, tag[1].toLowerCase());
      }
    }
    return true;
  }
  /**
   * Fetches app handler information
   * If no app information is available on the kind:31990,
   * we fetch the event's author's profile and return that instead.
   */
  async fetchProfile() {
    if (this.profile === void 0 && this.content.length > 0) {
      try {
        const profile = JSON.parse(this.content);
        if (profile?.name) {
          return profile;
        }
        this.profile = null;
      } catch (_e) {
        this.profile = null;
      }
    }
    return new Promise((resolve, reject) => {
      const author = this.author;
      author.fetchProfile().then(() => {
        resolve(author.profile);
      }).catch(reject);
    });
  }
};
var NutzapValidationCode = /* @__PURE__ */ ((NutzapValidationCode2) => {
  NutzapValidationCode2["NO_PROOFS"] = "NO_PROOFS";
  NutzapValidationCode2["INVALID_PROOF_COUNT"] = "INVALID_PROOF_COUNT";
  NutzapValidationCode2["MULTIPLE_RECIPIENTS"] = "MULTIPLE_RECIPIENTS";
  NutzapValidationCode2["NO_RECIPIENT"] = "NO_RECIPIENT";
  NutzapValidationCode2["MULTIPLE_MINTS"] = "MULTIPLE_MINTS";
  NutzapValidationCode2["NO_MINT"] = "NO_MINT";
  NutzapValidationCode2["MULTIPLE_EVENT_TAGS"] = "MULTIPLE_EVENT_TAGS";
  NutzapValidationCode2["MALFORMED_PROOF_SECRET"] = "MALFORMED_PROOF_SECRET";
  NutzapValidationCode2["MISSING_EVENT_TAG_IN_PROOF"] = "MISSING_EVENT_TAG_IN_PROOF";
  NutzapValidationCode2["MISMATCHED_EVENT_TAG_IN_PROOF"] = "MISMATCHED_EVENT_TAG_IN_PROOF";
  NutzapValidationCode2["MISSING_SENDER_TAG_IN_PROOF"] = "MISSING_SENDER_TAG_IN_PROOF";
  NutzapValidationCode2["MISMATCHED_SENDER_TAG_IN_PROOF"] = "MISMATCHED_SENDER_TAG_IN_PROOF";
  NutzapValidationCode2["NO_EVENT_TAG_IN_EVENT"] = "NO_EVENT_TAG_IN_EVENT";
  return NutzapValidationCode2;
})(NutzapValidationCode || {});
var NutzapValidationSeverity = /* @__PURE__ */ ((NutzapValidationSeverity2) => {
  NutzapValidationSeverity2["ERROR"] = "ERROR";
  NutzapValidationSeverity2["WARNING"] = "WARNING";
  return NutzapValidationSeverity2;
})(NutzapValidationSeverity || {});
var SEVERITY_MAP = {
  [
    "NO_PROOFS"
    /* NO_PROOFS */
  ]: "ERROR",
  [
    "INVALID_PROOF_COUNT"
    /* INVALID_PROOF_COUNT */
  ]: "ERROR",
  [
    "MULTIPLE_RECIPIENTS"
    /* MULTIPLE_RECIPIENTS */
  ]: "ERROR",
  [
    "NO_RECIPIENT"
    /* NO_RECIPIENT */
  ]: "ERROR",
  [
    "MULTIPLE_MINTS"
    /* MULTIPLE_MINTS */
  ]: "ERROR",
  [
    "NO_MINT"
    /* NO_MINT */
  ]: "ERROR",
  [
    "MULTIPLE_EVENT_TAGS"
    /* MULTIPLE_EVENT_TAGS */
  ]: "ERROR",
  [
    "MALFORMED_PROOF_SECRET"
    /* MALFORMED_PROOF_SECRET */
  ]: "ERROR",
  [
    "MISSING_EVENT_TAG_IN_PROOF"
    /* MISSING_EVENT_TAG_IN_PROOF */
  ]: "WARNING",
  [
    "MISMATCHED_EVENT_TAG_IN_PROOF"
    /* MISMATCHED_EVENT_TAG_IN_PROOF */
  ]: "WARNING",
  [
    "MISSING_SENDER_TAG_IN_PROOF"
    /* MISSING_SENDER_TAG_IN_PROOF */
  ]: "WARNING",
  [
    "MISMATCHED_SENDER_TAG_IN_PROOF"
    /* MISMATCHED_SENDER_TAG_IN_PROOF */
  ]: "WARNING",
  [
    "NO_EVENT_TAG_IN_EVENT"
    /* NO_EVENT_TAG_IN_EVENT */
  ]: "WARNING"
  /* WARNING */
};
var ERROR_MESSAGES = {
  [
    "NO_PROOFS"
    /* NO_PROOFS */
  ]: "Nutzap must contain at least one proof",
  [
    "INVALID_PROOF_COUNT"
    /* INVALID_PROOF_COUNT */
  ]: "Invalid proof count",
  [
    "MULTIPLE_RECIPIENTS"
    /* MULTIPLE_RECIPIENTS */
  ]: "Nutzap must have exactly one recipient (p tag)",
  [
    "NO_RECIPIENT"
    /* NO_RECIPIENT */
  ]: "Nutzap must have a recipient (p tag)",
  [
    "MULTIPLE_MINTS"
    /* MULTIPLE_MINTS */
  ]: "Nutzap must specify exactly one mint (u tag)",
  [
    "NO_MINT"
    /* NO_MINT */
  ]: "Nutzap must specify a mint (u tag)",
  [
    "MULTIPLE_EVENT_TAGS"
    /* MULTIPLE_EVENT_TAGS */
  ]: "Nutzap must have at most one event tag (e tag)",
  [
    "MALFORMED_PROOF_SECRET"
    /* MALFORMED_PROOF_SECRET */
  ]: "Proof secret is malformed and cannot be parsed",
  [
    "MISSING_EVENT_TAG_IN_PROOF"
    /* MISSING_EVENT_TAG_IN_PROOF */
  ]: "Proof secret missing 'e' tag for replay protection",
  [
    "MISMATCHED_EVENT_TAG_IN_PROOF"
    /* MISMATCHED_EVENT_TAG_IN_PROOF */
  ]: "Proof secret 'e' tag does not match event being zapped",
  [
    "MISSING_SENDER_TAG_IN_PROOF"
    /* MISSING_SENDER_TAG_IN_PROOF */
  ]: "Proof secret missing 'P' tag for sender verification",
  [
    "MISMATCHED_SENDER_TAG_IN_PROOF"
    /* MISMATCHED_SENDER_TAG_IN_PROOF */
  ]: "Proof secret 'P' tag does not match sender pubkey",
  [
    "NO_EVENT_TAG_IN_EVENT"
    /* NO_EVENT_TAG_IN_EVENT */
  ]: "Nutzap event missing 'e' tag (recommended for replay protection)"
};
function createValidationIssue(code, proofIndex) {
  return {
    code,
    severity: SEVERITY_MAP[code],
    message: ERROR_MESSAGES[code],
    proofIndex
  };
}
var NDKNutzap = class _NDKNutzap extends NDKEvent {
  debug;
  _proofs = [];
  static kind = 9321;
  static kinds = [_NDKNutzap.kind];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 9321;
    this.debug = ndk?.debug.extend("nutzap") ?? (0, import_debug4.default)("ndk:nutzap");
    if (!this.alt) this.alt = "This is a nutzap";
    try {
      const proofTags = this.getMatchingTags("proof");
      if (proofTags.length) {
        this._proofs = proofTags.map((tag) => JSON.parse(tag[1]));
      } else {
        this._proofs = JSON.parse(this.content);
      }
    } catch {
      return;
    }
  }
  static from(event) {
    const e = new _NDKNutzap(event.ndk, event);
    if (!e._proofs || !e._proofs.length) return;
    return e;
  }
  set comment(comment) {
    this.content = comment ?? "";
  }
  get comment() {
    const c = this.tagValue("comment");
    if (c) return c;
    return this.content;
  }
  set proofs(proofs) {
    this._proofs = proofs;
    this.tags = this.tags.filter((tag) => tag[0] !== "proof");
    for (const proof of proofs) {
      this.tags.push(["proof", JSON.stringify(proof)]);
    }
  }
  get proofs() {
    return this._proofs;
  }
  get rawP2pk() {
    const firstProof = this.proofs[0];
    try {
      const secret = JSON.parse(firstProof.secret);
      let payload;
      if (typeof secret === "string") {
        payload = JSON.parse(secret);
        this.debug("stringified payload", firstProof.secret);
      } else if (typeof secret === "object") {
        payload = secret;
      }
      if (Array.isArray(payload) && payload[0] === "P2PK" && payload.length > 1 && typeof payload[1] === "object" && payload[1] !== null) {
        return payload[1].data;
      }
      if (typeof payload === "object" && payload !== null && typeof payload[1]?.data === "string") {
        return payload[1].data;
      }
    } catch (e) {
      this.debug("error parsing p2pk pubkey", e, this.proofs[0]);
    }
    return void 0;
  }
  /**
   * Gets the p2pk pubkey that is embedded in the first proof.
   *
   * Note that this returns a nostr pubkey, not a cashu pubkey (no "02" prefix)
   */
  get p2pk() {
    const rawP2pk = this.rawP2pk;
    if (!rawP2pk) return;
    return rawP2pk.startsWith("02") ? rawP2pk.slice(2) : rawP2pk;
  }
  /**
   * Get the mint where this nutzap proofs exist
   */
  get mint() {
    return this.tagValue("u");
  }
  set mint(value) {
    this.replaceTag(["u", value]);
  }
  get unit() {
    let _unit = this.tagValue("unit") ?? "sat";
    if (_unit?.startsWith("msat")) _unit = "sat";
    return _unit;
  }
  set unit(value) {
    this.removeTag("unit");
    if (value?.startsWith("msat")) throw new Error("msat is not allowed, use sat denomination instead");
    if (value) this.tag(["unit", value]);
  }
  get amount() {
    const amount = this.proofs.reduce((total, proof) => total + proof.amount, 0);
    return amount;
  }
  sender = this.author;
  /**
   * Set the target of the nutzap
   * @param target The target of the nutzap (a user or an event)
   */
  set target(target) {
    this.tags = this.tags.filter((t) => t[0] !== "p");
    if (target instanceof NDKEvent) {
      this.tags.push(target.tagReference());
    }
  }
  set recipientPubkey(pubkey) {
    this.removeTag("p");
    this.tag(["p", pubkey]);
  }
  get recipientPubkey() {
    return this.tagValue("p");
  }
  get recipient() {
    const pubkey = this.recipientPubkey;
    if (this.ndk) return this.ndk.getUser({ pubkey });
    return new NDKUser({ pubkey });
  }
  async toNostrEvent() {
    if (this.unit === "msat") {
      this.unit = "sat";
    }
    this.removeTag("amount");
    this.tags.push(["amount", this.amount.toString()]);
    const event = await super.toNostrEvent();
    event.content = this.comment;
    return event;
  }
  /**
   * Validates that the nutzap conforms to NIP-61
   * @deprecated Use validateNIP61() instead for detailed validation results
   */
  get isValid() {
    const result = this.validateNIP61();
    return result.valid;
  }
  /**
   * Performs comprehensive validation of the nutzap according to NIP-61.
   * Returns detailed validation results including errors and warnings.
   *
   * Errors make the nutzap invalid, warnings are recommendations for best practices.
   */
  validateNIP61() {
    const issues = [];
    let eTagCount = 0;
    let pTagCount = 0;
    let mintTagCount = 0;
    for (const tag of this.tags) {
      if (tag[0] === "e") eTagCount++;
      if (tag[0] === "p") pTagCount++;
      if (tag[0] === "u") mintTagCount++;
    }
    if (this.proofs.length === 0) {
      issues.push(createValidationIssue(
        "NO_PROOFS"
        /* NO_PROOFS */
      ));
    }
    if (pTagCount === 0) {
      issues.push(createValidationIssue(
        "NO_RECIPIENT"
        /* NO_RECIPIENT */
      ));
    } else if (pTagCount > 1) {
      issues.push(createValidationIssue(
        "MULTIPLE_RECIPIENTS"
        /* MULTIPLE_RECIPIENTS */
      ));
    }
    if (mintTagCount === 0) {
      issues.push(createValidationIssue(
        "NO_MINT"
        /* NO_MINT */
      ));
    } else if (mintTagCount > 1) {
      issues.push(createValidationIssue(
        "MULTIPLE_MINTS"
        /* MULTIPLE_MINTS */
      ));
    }
    if (eTagCount > 1) {
      issues.push(createValidationIssue(
        "MULTIPLE_EVENT_TAGS"
        /* MULTIPLE_EVENT_TAGS */
      ));
    }
    const eventId = this.tagValue("e");
    const senderPubkey = this.pubkey;
    for (let i2 = 0; i2 < this.proofs.length; i2++) {
      const proof = this.proofs[i2];
      try {
        const secret = JSON.parse(proof.secret);
        const payload = typeof secret === "string" ? JSON.parse(secret) : secret;
        if (Array.isArray(payload) && payload[0] === "P2PK" && payload[1]) {
          const tags = payload[1].tags;
          if (eventId) {
            if (!tags) {
              issues.push(
                createValidationIssue(
                  "MISSING_EVENT_TAG_IN_PROOF",
                  i2
                )
              );
            } else {
              const eTag = tags.find((t) => t[0] === "e");
              if (!eTag) {
                issues.push(
                  createValidationIssue(
                    "MISSING_EVENT_TAG_IN_PROOF",
                    i2
                  )
                );
              } else if (eTag[1] !== eventId) {
                issues.push(
                  createValidationIssue(
                    "MISMATCHED_EVENT_TAG_IN_PROOF",
                    i2
                  )
                );
              }
            }
          }
          if (!tags) {
            issues.push(
              createValidationIssue("MISSING_SENDER_TAG_IN_PROOF", i2)
            );
          } else {
            const PTag = tags.find((t) => t[0] === "P");
            if (!PTag) {
              issues.push(
                createValidationIssue(
                  "MISSING_SENDER_TAG_IN_PROOF",
                  i2
                )
              );
            } else if (PTag[1] !== senderPubkey) {
              issues.push(
                createValidationIssue(
                  "MISMATCHED_SENDER_TAG_IN_PROOF",
                  i2
                )
              );
            }
          }
        }
      } catch {
        issues.push(
          createValidationIssue("MALFORMED_PROOF_SECRET", i2)
        );
      }
    }
    if (!eventId && this.proofs.length > 0) {
      issues.push(createValidationIssue(
        "NO_EVENT_TAG_IN_EVENT"
        /* NO_EVENT_TAG_IN_EVENT */
      ));
    }
    const hasErrors = issues.some(
      (issue) => issue.severity === "ERROR"
      /* ERROR */
    );
    return {
      valid: !hasErrors,
      issues
    };
  }
};
function proofP2pk(proof) {
  try {
    const secret = JSON.parse(proof.secret);
    let payload = {};
    if (typeof secret === "string") {
      payload = JSON.parse(secret);
    } else if (typeof secret === "object") {
      payload = secret;
    }
    const isP2PKLocked = payload[0] === "P2PK" && payload[1]?.data;
    if (isP2PKLocked) {
      return payload[1].data;
    }
  } catch (e) {
    console.error("error parsing p2pk pubkey", e, proof);
  }
}
function proofP2pkNostr(proof) {
  const p2pk = proofP2pk(proof);
  if (!p2pk) return;
  if (p2pk.startsWith("02") && p2pk.length === 66) return p2pk.slice(2);
  return p2pk;
}
function cashuPubkeyToNostrPubkey(cashuPubkey) {
  if (cashuPubkey.startsWith("02") && cashuPubkey.length === 66) return cashuPubkey.slice(2);
  return void 0;
}
var NDKProject = class _NDKProject extends NDKEvent {
  static kind = 31933;
  static kinds = [
    31933
    /* Project */
  ];
  _signer;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 31933;
  }
  static from(event) {
    return new _NDKProject(event.ndk, event.rawEvent());
  }
  set repo(value) {
    this.removeTag("repo");
    if (value) this.tags.push(["repo", value]);
  }
  set hashtags(values) {
    this.removeTag("hashtags");
    if (values.filter((t) => t.length > 0).length) this.tags.push(["hashtags", ...values]);
  }
  get hashtags() {
    const tag = this.tags.find((tag2) => tag2[0] === "hashtags");
    return tag ? tag.slice(1) : [];
  }
  get repo() {
    return this.tagValue("repo");
  }
  get title() {
    return this.tagValue("title");
  }
  set title(value) {
    this.removeTag("title");
    if (value) this.tags.push(["title", value]);
  }
  get picture() {
    return this.tagValue("picture");
  }
  set picture(value) {
    this.removeTag("picture");
    if (value) this.tags.push(["picture", value]);
  }
  set description(value) {
    this.content = value;
  }
  get description() {
    return this.content;
  }
  /**
   * The project slug, derived from the 'd' tag.
   */
  get slug() {
    return this.dTag ?? "empty-dtag";
  }
  async getSigner() {
    if (this._signer) return this._signer;
    const encryptedKey = this.tagValue("key");
    if (!encryptedKey) {
      this._signer = NDKPrivateKeySigner.generate();
      await this.encryptAndSaveNsec();
    } else {
      const decryptedKey = await this.ndk?.signer?.decrypt(this.ndk.activeUser, encryptedKey);
      if (!decryptedKey) {
        throw new Error("Failed to decrypt project key or missing signer context.");
      }
      this._signer = new NDKPrivateKeySigner(decryptedKey);
    }
    return this._signer;
  }
  async getNsec() {
    const signer = await this.getSigner();
    return signer.privateKey;
  }
  async setNsec(value) {
    this._signer = new NDKPrivateKeySigner(value);
    await this.encryptAndSaveNsec();
  }
  async encryptAndSaveNsec() {
    if (!this._signer) throw new Error("Signer is not set.");
    const key = this._signer.privateKey;
    const encryptedKey = await this.ndk?.signer?.encrypt(this.ndk.activeUser, key);
    if (encryptedKey) {
      this.removeTag("key");
      this.tags.push(["key", encryptedKey]);
    }
  }
};
var NDKProjectTemplate = class _NDKProjectTemplate extends NDKEvent {
  static kind = 30717;
  static kinds = [
    30717
    /* ProjectTemplate */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 30717;
  }
  static from(event) {
    return new _NDKProjectTemplate(event.ndk, event.rawEvent());
  }
  /**
   * Template identifier from 'd' tag
   */
  get templateId() {
    return this.dTag ?? "";
  }
  set templateId(value) {
    this.dTag = value;
  }
  /**
   * Template name from 'title' tag
   */
  get name() {
    return this.tagValue("title") ?? "";
  }
  set name(value) {
    this.removeTag("title");
    if (value) this.tags.push(["title", value]);
  }
  /**
   * Template description from 'description' tag
   */
  get description() {
    return this.tagValue("description") ?? "";
  }
  set description(value) {
    this.removeTag("description");
    if (value) this.tags.push(["description", value]);
  }
  /**
   * Git repository URL from 'uri' tag
   */
  get repoUrl() {
    return this.tagValue("uri") ?? "";
  }
  set repoUrl(value) {
    this.removeTag("uri");
    if (value) this.tags.push(["uri", value]);
  }
  /**
   * Template preview image URL from 'image' tag
   */
  get image() {
    return this.tagValue("image");
  }
  set image(value) {
    this.removeTag("image");
    if (value) this.tags.push(["image", value]);
  }
  /**
   * Command to run from 'command' tag
   */
  get command() {
    return this.tagValue("command");
  }
  set command(value) {
    this.removeTag("command");
    if (value) this.tags.push(["command", value]);
  }
  /**
   * Agent configuration from 'agent' tag
   */
  get agentConfig() {
    const agentTag = this.tagValue("agent");
    if (!agentTag) return void 0;
    try {
      return JSON.parse(agentTag);
    } catch {
      return void 0;
    }
  }
  set agentConfig(value) {
    this.removeTag("agent");
    if (value) {
      this.tags.push(["agent", JSON.stringify(value)]);
    }
  }
  /**
   * Template tags from 't' tags
   */
  get templateTags() {
    return this.getMatchingTags("t").map((tag) => tag[1]).filter(Boolean);
  }
  set templateTags(values) {
    this.tags = this.tags.filter((tag) => tag[0] !== "t");
    values.forEach((value) => {
      if (value) this.tags.push(["t", value]);
    });
  }
};
var READ_MARKER = "read";
var WRITE_MARKER = "write";
var NDKRelayList = class _NDKRelayList extends NDKEvent {
  static kind = 10002;
  static kinds = [
    10002
    /* RelayList */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10002;
  }
  static from(ndkEvent) {
    return new _NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  get readRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2] || tag[2] && tag[2] === READ_MARKER).map((tag) => tryNormalizeRelayUrl(tag[1])).filter((url) => !!url);
  }
  set readRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, READ_MARKER]);
    }
  }
  get writeRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2] || tag[2] && tag[2] === WRITE_MARKER).map((tag) => tryNormalizeRelayUrl(tag[1])).filter((url) => !!url);
  }
  set writeRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, WRITE_MARKER]);
    }
  }
  get bothRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2]).map((tag) => tag[1]);
  }
  set bothRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay]);
    }
  }
  get relays() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").map((tag) => tag[1]);
  }
  /**
   * Provides a relaySet for the relays in this list.
   */
  get relaySet() {
    if (!this.ndk) throw new Error("NDKRelayList has no NDK instance");
    return new NDKRelaySet(
      new Set(this.relays.map((u) => this.ndk?.pool.getRelay(u)).filter((r) => !!r)),
      this.ndk
    );
  }
};
function relayListFromKind3(ndk, contactList) {
  try {
    const content = JSON.parse(contactList.content);
    const relayList = new NDKRelayList(ndk);
    const readRelays = /* @__PURE__ */ new Set();
    const writeRelays = /* @__PURE__ */ new Set();
    for (let [key, config] of Object.entries(content)) {
      try {
        key = normalizeRelayUrl(key);
      } catch {
        continue;
      }
      if (!config) {
        readRelays.add(key);
        writeRelays.add(key);
      } else {
        const relayConfig = config;
        if (relayConfig.write) writeRelays.add(key);
        if (relayConfig.read) readRelays.add(key);
      }
    }
    relayList.readRelayUrls = Array.from(readRelays);
    relayList.writeRelayUrls = Array.from(writeRelays);
    return relayList;
  } catch {
  }
  return void 0;
}
var NDKRelayFeedList = class _NDKRelayFeedList extends NDKList {
  static kind = 10012;
  static kinds = [
    10012
    /* RelayFeedList */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    if (!rawEvent?.kind) {
      this.kind = 10012;
    }
  }
  static from(ndkEvent) {
    return new _NDKRelayFeedList(ndkEvent.ndk, ndkEvent);
  }
  /**
   * Gets all relay URLs from the list.
   */
  get relayUrls() {
    return this.getMatchingTags("relay").map((tag) => tag[1]);
  }
  /**
   * Gets all relay set references (kind:30002 naddr) from the list.
   * Returns them in the format "kind:pubkey:dtag".
   */
  get relaySets() {
    return this.getMatchingTags("a").map((tag) => tag[1]);
  }
  /**
   * Adds a relay URL to the list.
   * @param relayUrl - WebSocket URL of the relay
   * @param mark - Optional mark to add to the relay tag
   * @param encrypted - Whether to encrypt the item
   * @param position - Where to add the item in the list
   */
  async addRelay(relayUrl, mark, encrypted = false, position = "bottom") {
    const tag = ["relay", relayUrl];
    if (mark) tag.push(mark);
    await this.addItem(tag, void 0, encrypted, position);
  }
  /**
   * Adds a relay set reference to the list.
   * @param relaySetNaddr - NIP-33 address in format "kind:pubkey:dtag" (kind should be 30002)
   * @param mark - Optional mark to add to the relay set tag
   * @param encrypted - Whether to encrypt the item
   * @param position - Where to add the item in the list
   */
  async addRelaySet(relaySetNaddr, mark, encrypted = false, position = "bottom") {
    const tag = ["a", relaySetNaddr];
    if (mark) tag.push(mark);
    await this.addItem(tag, void 0, encrypted, position);
  }
  /**
   * Removes a relay URL from the list.
   * @param relayUrl - The relay URL to remove
   * @param publish - Whether to publish the change
   */
  async removeRelay(relayUrl, publish = true) {
    await this.removeItemByValue(relayUrl, publish);
  }
  /**
   * Removes a relay set from the list.
   * @param relaySetNaddr - The relay set naddr to remove
   * @param publish - Whether to publish the change
   */
  async removeRelaySet(relaySetNaddr, publish = true) {
    await this.removeItemByValue(relaySetNaddr, publish);
  }
};
var NDKRepost = class _NDKRepost extends NDKEvent {
  _repostedEvents;
  static kind = 6;
  static kinds = [
    6,
    16
    /* GenericRepost */
  ];
  static from(event) {
    return new _NDKRepost(event.ndk, event.rawEvent());
  }
  /**
   * Returns all reposted events by the current event.
   *
   * @param klass Optional class to convert the events to.
   * @returns
   */
  async repostedEvents(klass, opts) {
    const items = [];
    if (!this.ndk) throw new Error("NDK instance not set");
    if (this._repostedEvents !== void 0) return this._repostedEvents;
    for (const eventId of this.repostedEventIds()) {
      const filter = filterForId(eventId);
      const event = await this.ndk.fetchEvent(filter, opts);
      if (event) {
        items.push(klass ? klass.from(event) : event);
      }
    }
    return items;
  }
  /**
   * Returns the reposted event IDs.
   */
  repostedEventIds() {
    return this.tags.filter((t) => t[0] === "e" || t[0] === "a").map((t) => t[1]);
  }
};
function filterForId(id) {
  if (id.match(/:/)) {
    const [kind, pubkey, identifier] = id.split(":");
    return {
      kinds: [Number.parseInt(kind)],
      authors: [pubkey],
      "#d": [identifier]
    };
  }
  return { ids: [id] };
}
var NDKSimpleGroupMemberList = class _NDKSimpleGroupMemberList extends NDKEvent {
  relaySet;
  memberSet = /* @__PURE__ */ new Set();
  static kind = 39002;
  static kinds = [
    39002
    /* GroupMembers */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39002;
    this.memberSet = new Set(this.members);
  }
  static from(event) {
    return new _NDKSimpleGroupMemberList(event.ndk, event);
  }
  get members() {
    return this.getMatchingTags("p").map((tag) => tag[1]);
  }
  hasMember(member) {
    return this.memberSet.has(member);
  }
  async publish(relaySet, timeoutMs, requiredRelayCount) {
    relaySet ??= this.relaySet;
    return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount);
  }
};
var NDKSimpleGroupMetadata = class _NDKSimpleGroupMetadata extends NDKEvent {
  static kind = 39e3;
  static kinds = [
    39e3
    /* GroupMetadata */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39e3;
  }
  static from(event) {
    return new _NDKSimpleGroupMetadata(event.ndk, event);
  }
  get name() {
    return this.tagValue("name");
  }
  get picture() {
    return this.tagValue("picture");
  }
  get about() {
    return this.tagValue("about");
  }
  get scope() {
    if (this.getMatchingTags("public").length > 0) return "public";
    if (this.getMatchingTags("public").length > 0) return "private";
    return void 0;
  }
  set scope(scope) {
    this.removeTag("public");
    this.removeTag("private");
    if (scope === "public") {
      this.tags.push(["public", ""]);
    } else if (scope === "private") {
      this.tags.push(["private", ""]);
    }
  }
  get access() {
    if (this.getMatchingTags("open").length > 0) return "open";
    if (this.getMatchingTags("closed").length > 0) return "closed";
    return void 0;
  }
  set access(access) {
    this.removeTag("open");
    this.removeTag("closed");
    if (access === "open") {
      this.tags.push(["open", ""]);
    } else if (access === "closed") {
      this.tags.push(["closed", ""]);
    }
  }
};
var NDKStoryStickerType = /* @__PURE__ */ ((NDKStoryStickerType2) => {
  NDKStoryStickerType2["Pubkey"] = "pubkey";
  NDKStoryStickerType2["Event"] = "event";
  NDKStoryStickerType2["Prompt"] = "prompt";
  NDKStoryStickerType2["Text"] = "text";
  NDKStoryStickerType2["Countdown"] = "countdown";
  return NDKStoryStickerType2;
})(NDKStoryStickerType || {});
function strToPosition(positionStr) {
  const [x, y] = positionStr.split(",").map(Number);
  return { x, y };
}
function strToDimension(dimensionStr) {
  const [width, height] = dimensionStr.split("x").map(Number);
  return { width, height };
}
var NDKStorySticker = class _NDKStorySticker {
  static Text = "text";
  static Pubkey = "pubkey";
  static Event = "event";
  static Prompt = "prompt";
  static Countdown = "countdown";
  type;
  value;
  position;
  dimension;
  properties;
  constructor(arg) {
    if (Array.isArray(arg)) {
      const tag = arg;
      if (tag[0] !== "sticker" || tag.length < 5) {
        throw new Error("Invalid sticker tag");
      }
      this.type = tag[1];
      this.value = tag[2];
      this.position = strToPosition(tag[3]);
      this.dimension = strToDimension(tag[4]);
      const props = {};
      for (let i2 = 5; i2 < tag.length; i2++) {
        const [key, ...rest] = tag[i2].split(" ");
        props[key] = rest.join(" ");
      }
      if (Object.keys(props).length > 0) {
        this.properties = props;
      }
    } else {
      this.type = arg;
      this.value = void 0;
      this.position = { x: 0, y: 0 };
      this.dimension = { width: 0, height: 0 };
    }
  }
  static fromTag(tag) {
    try {
      return new _NDKStorySticker(tag);
    } catch {
      return null;
    }
  }
  get style() {
    return this.properties?.style;
  }
  set style(style) {
    if (style) this.properties = { ...this.properties, style };
    else delete this.properties?.style;
  }
  get rotation() {
    return this.properties?.rot ? Number.parseFloat(this.properties.rot) : void 0;
  }
  set rotation(rotation) {
    if (rotation !== void 0) {
      this.properties = { ...this.properties, rot: rotation.toString() };
    } else {
      delete this.properties?.rot;
    }
  }
  /**
   * Checks if the sticker is valid.
   *
   * @returns {boolean} - True if the sticker is valid, false otherwise.
   */
  get isValid() {
    return this.hasValidDimensions() && this.hasValidPosition();
  }
  hasValidDimensions = () => {
    return typeof this.dimension.width === "number" && typeof this.dimension.height === "number" && !Number.isNaN(this.dimension.width) && !Number.isNaN(this.dimension.height);
  };
  hasValidPosition = () => {
    return typeof this.position.x === "number" && typeof this.position.y === "number" && !Number.isNaN(this.position.x) && !Number.isNaN(this.position.y);
  };
  toTag() {
    if (!this.isValid) {
      const errors = [
        !this.hasValidDimensions() ? "dimensions is invalid" : void 0,
        !this.hasValidPosition() ? "position is invalid" : void 0
      ].filter(Boolean);
      throw new Error(`Invalid sticker: ${errors.join(", ")}`);
    }
    let value;
    switch (this.type) {
      case "event":
        value = this.value.tagId();
        break;
      case "pubkey":
        value = this.value.pubkey;
        break;
      default:
        value = this.value;
    }
    const tag = ["sticker", this.type, value, coordinates(this.position), dimension(this.dimension)];
    if (this.properties) {
      for (const [key, propValue] of Object.entries(this.properties)) {
        tag.push(`${key} ${propValue}`);
      }
    }
    return tag;
  }
};
var NDKStory = class _NDKStory extends NDKEvent {
  static kind = 23;
  static kinds = [
    23
    /* Story */
  ];
  _imeta;
  _dimensions;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 23;
    if (rawEvent) {
      for (const tag of rawEvent.tags) {
        switch (tag[0]) {
          case "imeta":
            this._imeta = mapImetaTag(tag);
            break;
          case "dim":
            this.dimensions = strToDimension(tag[1]);
            break;
        }
      }
    }
  }
  /**
   * Creates a NDKStory from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKStory from.
   * @returns NDKStory
   */
  static from(event) {
    return new _NDKStory(event.ndk, event);
  }
  /**
   * Checks if the story is valid (has exactly one imeta tag).
   */
  get isValid() {
    return !!this.imeta;
  }
  /**
   * Gets the first imeta tag (there should only be one).
   */
  get imeta() {
    return this._imeta;
  }
  /**
   * Sets a single imeta tag, replacing any existing ones.
   */
  set imeta(tag) {
    this._imeta = tag;
    this.tags = this.tags.filter((t) => t[0] !== "imeta");
    if (tag) {
      this.tags.push(imetaTagToTag(tag));
    }
  }
  /**
   * Getter for the story dimensions.
   *
   * @returns {NDKStoryDimension | undefined} - The story dimensions if available, otherwise undefined.
   */
  get dimensions() {
    const dimTag = this.tagValue("dim");
    if (!dimTag) return void 0;
    return strToDimension(dimTag);
  }
  /**
   * Setter for the story dimensions.
   *
   * @param {NDKStoryDimension | undefined} dimensions - The dimensions to set for the story.
   */
  set dimensions(dimensions) {
    this.removeTag("dim");
    if (dimensions) {
      this.tags.push(["dim", `${dimensions.width}x${dimensions.height}`]);
    }
  }
  /**
   * Getter for the story duration.
   *
   * @returns {number | undefined} - The story duration in seconds if available, otherwise undefined.
   */
  get duration() {
    const durTag = this.tagValue("dur");
    if (!durTag) return void 0;
    return Number.parseInt(durTag);
  }
  /**
   * Setter for the story duration.
   *
   * @param {number | undefined} duration - The duration in seconds to set for the story.
   */
  set duration(duration) {
    this.removeTag("dur");
    if (duration !== void 0) {
      this.tags.push(["dur", duration.toString()]);
    }
  }
  /**
   * Gets all stickers from the story.
   *
   * @returns {NDKStorySticker[]} - Array of stickers in the story.
   */
  get stickers() {
    const stickers = [];
    for (const tag of this.tags) {
      if (tag[0] !== "sticker" || tag.length < 5) continue;
      const sticker = NDKStorySticker.fromTag(tag);
      if (sticker) stickers.push(sticker);
    }
    return stickers;
  }
  /**
   * Adds a sticker to the story.
   *
   * @param {NDKStorySticker|StorySticker} sticker - The sticker to add.
   */
  addSticker(sticker) {
    let stickerToAdd;
    if (sticker instanceof NDKStorySticker) {
      stickerToAdd = sticker;
    } else {
      const tag = [
        "sticker",
        sticker.type,
        typeof sticker.value === "string" ? sticker.value : "",
        coordinates(sticker.position),
        dimension(sticker.dimension)
      ];
      if (sticker.properties) {
        for (const [key, value] of Object.entries(sticker.properties)) {
          tag.push(`${key} ${value}`);
        }
      }
      stickerToAdd = new NDKStorySticker(tag);
      stickerToAdd.value = sticker.value;
    }
    if (stickerToAdd.type === "pubkey") {
      this.tag(stickerToAdd.value);
    } else if (stickerToAdd.type === "event") {
      this.tag(stickerToAdd.value);
    }
    this.tags.push(stickerToAdd.toTag());
  }
  /**
   * Removes a sticker from the story.
   *
   * @param {number} index - The index of the sticker to remove.
   */
  removeSticker(index) {
    const stickers = this.stickers;
    if (index < 0 || index >= stickers.length) return;
    let stickerCount = 0;
    for (let i2 = 0; i2 < this.tags.length; i2++) {
      if (this.tags[i2][0] === "sticker") {
        if (stickerCount === index) {
          this.tags.splice(i2, 1);
          break;
        }
        stickerCount++;
      }
    }
  }
};
var coordinates = (position) => `${position.x},${position.y}`;
var dimension = (dimension2) => `${dimension2.width}x${dimension2.height}`;
var NDKSubscriptionReceipt = class _NDKSubscriptionReceipt extends NDKEvent {
  debug;
  static kind = 7003;
  static kinds = [
    7003
    /* SubscriptionReceipt */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7003;
    this.debug = ndk?.debug.extend("subscription-start") ?? (0, import_debug5.default)("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionReceipt(event.ndk, event.rawEvent());
  }
  /**
   * This is the person being subscribed to
   */
  get recipient() {
    const pTag = this.getMatchingTags("p")?.[0];
    if (!pTag) return void 0;
    const user = new NDKUser({ pubkey: pTag[1] });
    return user;
  }
  set recipient(user) {
    this.removeTag("p");
    if (!user) return;
    this.tags.push(["p", user.pubkey]);
  }
  /**
   * This is the person subscribing
   */
  get subscriber() {
    const PTag = this.getMatchingTags("P")?.[0];
    if (!PTag) return void 0;
    const user = new NDKUser({ pubkey: PTag[1] });
    return user;
  }
  set subscriber(user) {
    this.removeTag("P");
    if (!user) return;
    this.tags.push(["P", user.pubkey]);
  }
  set subscriptionStart(event) {
    this.debug(`before setting subscription start: ${this.rawEvent}`);
    this.removeTag("e");
    this.tag(event, "subscription", true);
    this.debug(`after setting subscription start: ${this.rawEvent}`);
  }
  get tierName() {
    const tag = this.getMatchingTags("tier")?.[0];
    return tag?.[1];
  }
  get isValid() {
    const period = this.validPeriod;
    if (!period) {
      return false;
    }
    if (period.start > period.end) {
      return false;
    }
    const pTags = this.getMatchingTags("p");
    const PTags = this.getMatchingTags("P");
    if (pTags.length !== 1 || PTags.length !== 1) {
      return false;
    }
    return true;
  }
  get validPeriod() {
    const tag = this.getMatchingTags("valid")?.[0];
    if (!tag) return void 0;
    try {
      return {
        start: new Date(Number.parseInt(tag[1]) * 1e3),
        end: new Date(Number.parseInt(tag[2]) * 1e3)
      };
    } catch {
      return void 0;
    }
  }
  set validPeriod(period) {
    this.removeTag("valid");
    if (!period) return;
    this.tags.push([
      "valid",
      Math.floor(period.start.getTime() / 1e3).toString(),
      Math.floor(period.end.getTime() / 1e3).toString()
    ]);
  }
  get startPeriod() {
    return this.validPeriod?.start;
  }
  get endPeriod() {
    return this.validPeriod?.end;
  }
  /**
   * Whether the subscription is currently active
   */
  isActive(time) {
    time ??= /* @__PURE__ */ new Date();
    const period = this.validPeriod;
    if (!period) return false;
    if (time < period.start) return false;
    if (time > period.end) return false;
    return true;
  }
};
var possibleIntervalFrequencies = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
];
function calculateTermDurationInSeconds(term) {
  switch (term) {
    case "daily":
      return 24 * 60 * 60;
    case "weekly":
      return 7 * 24 * 60 * 60;
    case "monthly":
      return 30 * 24 * 60 * 60;
    case "quarterly":
      return 3 * 30 * 24 * 60 * 60;
    case "yearly":
      return 365 * 24 * 60 * 60;
  }
}
function newAmount(amount, currency, term) {
  return ["amount", amount.toString(), currency, term];
}
function parseTagToSubscriptionAmount(tag) {
  const amount = Number.parseInt(tag[1]);
  if (Number.isNaN(amount) || amount === void 0 || amount === null || amount <= 0) return void 0;
  const currency = tag[2];
  if (currency === void 0 || currency === "") return void 0;
  const term = tag[3];
  if (term === void 0) return void 0;
  if (!possibleIntervalFrequencies.includes(term)) return void 0;
  return {
    amount,
    currency,
    term
  };
}
var NDKSubscriptionTier = class _NDKSubscriptionTier extends NDKArticle {
  static kind = 37001;
  static kinds = [
    37001
    /* SubscriptionTier */
  ];
  constructor(ndk, rawEvent) {
    const k = rawEvent?.kind ?? 37001;
    super(ndk, rawEvent);
    this.kind = k;
  }
  /**
   * Creates a new NDKSubscriptionTier from an event
   * @param event
   * @returns NDKSubscriptionTier
   */
  static from(event) {
    return new _NDKSubscriptionTier(event.ndk, event);
  }
  /**
   * Returns perks for this tier
   */
  get perks() {
    return this.getMatchingTags("perk").map((tag) => tag[1]).filter((perk) => perk !== void 0);
  }
  /**
   * Adds a perk to this tier
   */
  addPerk(perk) {
    this.tags.push(["perk", perk]);
  }
  /**
   * Returns the amount for this tier
   */
  get amounts() {
    return this.getMatchingTags("amount").map((tag) => parseTagToSubscriptionAmount(tag)).filter((a) => a !== void 0);
  }
  /**
   * Adds an amount to this tier
   * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
   * @param currency Currency code. Use msat for millisatoshis
   * @param term One of daily, weekly, monthly, quarterly, yearly
   */
  addAmount(amount, currency, term) {
    this.tags.push(newAmount(amount, currency, term));
  }
  /**
   * Sets a relay where content related to this tier can be found
   * @param relayUrl URL of the relay
   */
  set relayUrl(relayUrl) {
    this.tags.push(["r", relayUrl]);
  }
  /**
   * Returns the relay URLs for this tier
   */
  get relayUrls() {
    return this.getMatchingTags("r").map((tag) => tag[1]).filter((relay) => relay !== void 0);
  }
  /**
   * Gets the verifier pubkey for this tier. This is the pubkey that will generate
   * subscription payment receipts
   */
  get verifierPubkey() {
    return this.tagValue("p");
  }
  /**
   * Sets the verifier pubkey for this tier.
   */
  set verifierPubkey(pubkey) {
    this.removeTag("p");
    if (pubkey) this.tags.push(["p", pubkey]);
  }
  /**
   * Checks if this tier is valid
   */
  get isValid() {
    return this.title !== void 0 && // Must have a title
    this.amounts.length > 0;
  }
};
var NDKSubscriptionStart = class _NDKSubscriptionStart extends NDKEvent {
  debug;
  static kind = 7001;
  static kinds = [
    7001
    /* Subscribe */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7001;
    this.debug = ndk?.debug.extend("subscription-start") ?? (0, import_debug6.default)("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionStart(event.ndk, event.rawEvent());
  }
  /**
   * Recipient of the subscription. I.e. The author of this event subscribes to this user.
   */
  get recipient() {
    const pTag = this.getMatchingTags("p")?.[0];
    if (!pTag) return void 0;
    const user = new NDKUser({ pubkey: pTag[1] });
    return user;
  }
  set recipient(user) {
    this.removeTag("p");
    if (!user) return;
    this.tags.push(["p", user.pubkey]);
  }
  /**
   * The amount of the subscription.
   */
  get amount() {
    const amountTag = this.getMatchingTags("amount")?.[0];
    if (!amountTag) return void 0;
    return parseTagToSubscriptionAmount(amountTag);
  }
  set amount(amount) {
    this.removeTag("amount");
    if (!amount) return;
    this.tags.push(newAmount(amount.amount, amount.currency, amount.term));
  }
  /**
   * The event id or NIP-33 tag id of the tier that the user is subscribing to.
   */
  get tierId() {
    const eTag = this.getMatchingTags("e")?.[0];
    const aTag = this.getMatchingTags("a")?.[0];
    if (!eTag || !aTag) return void 0;
    return eTag[1] ?? aTag[1];
  }
  set tier(tier) {
    this.removeTag("e");
    this.removeTag("a");
    this.removeTag("event");
    if (!tier) return;
    this.tag(tier);
    this.removeTag("p");
    this.tags.push(["p", tier.pubkey]);
    this.tags.push(["event", JSON.stringify(tier.rawEvent())]);
  }
  /**
   * Fetches the tier that the user is subscribing to.
   */
  async fetchTier() {
    const eventTag = this.tagValue("event");
    if (eventTag) {
      try {
        const parsedEvent = JSON.parse(eventTag);
        return new NDKSubscriptionTier(this.ndk, parsedEvent);
      } catch {
        this.debug("Failed to parse event tag");
      }
    }
    const tierId = this.tierId;
    if (!tierId) return void 0;
    const e = await this.ndk?.fetchEvent(tierId);
    if (!e) return void 0;
    return NDKSubscriptionTier.from(e);
  }
  get isValid() {
    if (this.getMatchingTags("amount").length !== 1) {
      this.debug("Invalid # of amount tag");
      return false;
    }
    if (!this.amount) {
      this.debug("Invalid amount tag");
      return false;
    }
    if (this.getMatchingTags("p").length !== 1) {
      this.debug("Invalid # of p tag");
      return false;
    }
    if (!this.recipient) {
      this.debug("Invalid p tag");
      return false;
    }
    return true;
  }
};
var NDKTask = class _NDKTask extends NDKEvent {
  static kind = 1934;
  static kinds = [
    1934
    /* Task */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 1934;
  }
  static from(event) {
    return new _NDKTask(event.ndk, event.rawEvent());
  }
  set title(value) {
    this.removeTag("title");
    if (value) this.tags.push(["title", value]);
  }
  get title() {
    return this.tagValue("title");
  }
  set project(project) {
    this.removeTag("a");
    this.tags.push(project.tagReference());
  }
  get projectSlug() {
    const tag = this.getMatchingTags("a")[0];
    return tag ? tag[1].split(/:/)?.[2] : void 0;
  }
};
var NDKThread = class _NDKThread extends NDKEvent {
  static kind = 11;
  static kinds = [
    11
    /* Thread */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 11;
  }
  /**
   * Creates an NDKThread from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKThread from.
   * @returns NDKThread
   */
  static from(event) {
    return new _NDKThread(event.ndk, event);
  }
  /**
   * Gets the title of the thread.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Sets the title of the thread.
   */
  set title(title) {
    this.removeTag("title");
    if (title) {
      this.tags.push(["title", title]);
    }
  }
};
var NDKVideo = class _NDKVideo extends NDKEvent {
  static kind = 21;
  static kinds = [
    34235,
    34236,
    22,
    21
    /* Video */
  ];
  _imetas;
  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from(event) {
    return new _NDKVideo(event.ndk, event.rawEvent());
  }
  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title(title) {
    this.removeTag("title");
    if (title) this.tags.push(["title", title]);
  }
  /**
   * Getter for the article thumbnail.
   *
   * @returns {string | undefined} - The article thumbnail if available, otherwise undefined.
   */
  get thumbnail() {
    let thumbnail;
    if (this.imetas && this.imetas.length > 0) {
      thumbnail = this.imetas[0].image?.[0];
    }
    return thumbnail ?? this.tagValue("thumb");
  }
  get imetas() {
    if (this._imetas) return this._imetas;
    this._imetas = this.tags.filter((tag) => tag[0] === "imeta").map(mapImetaTag);
    return this._imetas;
  }
  set imetas(tags) {
    this._imetas = tags;
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
    this.tags.push(...tags.map(imetaTagToTag));
  }
  get url() {
    if (this.imetas && this.imetas.length > 0) {
      return this.imetas[0].url;
    }
    return this.tagValue("url");
  }
  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return Number.parseInt(tag);
    }
    return void 0;
  }
  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags() {
    super.generateTags();
    if (!this.kind) {
      if (this.imetas?.[0]?.dim) {
        const [width, height] = this.imetas[0].dim.split("x");
        const isPortrait = width && height && Number.parseInt(width) < Number.parseInt(height);
        const isShort = this.duration && this.duration < 120;
        if (isShort && isPortrait) this.kind = 22;
        else this.kind = 21;
      }
    }
    return super.generateTags();
  }
  get duration() {
    const tag = this.tagValue("duration");
    if (tag) {
      return Number.parseInt(tag);
    }
    return void 0;
  }
  /**
   * Setter for the video's duration
   *
   * @param {number | undefined} duration - The duration to set for the video (in seconds)
   */
  set duration(dur) {
    this.removeTag("duration");
    if (dur !== void 0) {
      this.tags.push(["duration", Math.floor(dur).toString()]);
    }
  }
};
var NDKWiki = class _NDKWiki extends NDKArticle {
  static kind = 30818;
  static kinds = [
    30818
    /* Wiki */
  ];
  static from(event) {
    return new _NDKWiki(event.ndk, event.rawEvent());
  }
  get isDefered() {
    return this.hasTag("a", "defer");
  }
  get deferedId() {
    return this.tagValue("a", "defer");
  }
  /**
   * Defers the author's wiki event to another wiki event.
   *
   * Wiki-events can tag other wiki-events with a `defer` marker to indicate that it considers someone else's entry as a "better" version of itself. If using a `defer` marker both `a` and `e` tags SHOULD be used.
   *
   * @example
   * myWiki.defer = betterWikiEntryOnTheSameTopic;
   * myWiki.publishReplaceable()
   */
  set defer(deferedTo) {
    this.removeTag("a", "defer");
    this.tag(deferedTo, "defer");
  }
};
var NDKWikiMergeRequest = class _NDKWikiMergeRequest extends NDKEvent {
  static kind = 818;
  static kinds = [
    818
    /* WikiMergeRequest */
  ];
  static from(event) {
    return new _NDKWikiMergeRequest(event.ndk, event.rawEvent());
  }
  /**
   * The target ID (<kind:pubkey:d-tag>) of the wiki event to merge into.
   */
  get targetId() {
    return this.tagValue("a");
  }
  /**
   * Sets the target ID (<kind:pubkey:d-tag>) of the wiki event to merge into.
   */
  set target(targetEvent) {
    this.tags = this.tags.filter((tag) => {
      if (tag[0] === "a") return true;
      if (tag[0] === "e" && tag[3] !== "source") return true;
    });
    this.tag(targetEvent);
  }
  /**
   * The source ID of the wiki event to merge from.
   */
  get sourceId() {
    return this.tagValue("e", "source");
  }
  /**
   * Sets the event we are asking to get merged into the target.
   */
  set source(sourceEvent) {
    this.removeTag("e", "source");
    this.tag(sourceEvent, "source", false, "e");
  }
};
var registeredEventClasses = /* @__PURE__ */ new Set();
function registerEventClass(eventClass) {
  registeredEventClasses.add(eventClass);
}
function unregisterEventClass(eventClass) {
  registeredEventClasses.delete(eventClass);
}
function getRegisteredEventClasses() {
  return new Set(registeredEventClasses);
}
function wrapEvent3(event) {
  const eventWrappingMap = /* @__PURE__ */ new Map();
  const builtInClasses = [
    NDKImage,
    NDKVideo,
    NDKCashuMintList,
    NDKArticle,
    NDKHighlight,
    NDKDraft,
    NDKWiki,
    NDKWikiMergeRequest,
    NDKNutzap,
    NDKProject,
    NDKTask,
    NDKProjectTemplate,
    NDKSimpleGroupMemberList,
    NDKSimpleGroupMetadata,
    NDKSubscriptionTier,
    NDKSubscriptionStart,
    NDKSubscriptionReceipt,
    NDKList,
    NDKRelayList,
    NDKRelayFeedList,
    NDKStory,
    NDKBlossomList,
    NDKFollowPack,
    NDKThread,
    NDKRepost,
    NDKClassified,
    NDKAppHandlerEvent,
    NDKDVMJobFeedback,
    NDKCashuMintAnnouncement,
    NDKFedimintMint,
    NDKMintRecommendation
  ];
  const allClasses = [...builtInClasses, ...registeredEventClasses];
  for (const klass2 of allClasses) {
    for (const kind of klass2.kinds) {
      eventWrappingMap.set(kind, klass2);
    }
  }
  const klass = eventWrappingMap.get(event.kind);
  if (klass) return klass.from(event);
  return event;
}
function checkMissingKind(event, error) {
  if (event.kind === void 0 || event.kind === null) {
    error(
      "event-missing-kind",
      `Cannot sign event without 'kind'.

\u{1F4E6} Event data:
   \u2022 content: ${event.content ? `"${event.content.substring(0, 50)}${event.content.length > 50 ? "..." : ""}"` : "(empty)"}
   \u2022 tags: ${event.tags.length} tag${event.tags.length !== 1 ? "s" : ""}
   \u2022 kind: ${event.kind} \u274C

Set event.kind before signing.`,
      "Example: event.kind = 1; // for text note",
      false
      // Fatal error - cannot be disabled
    );
  }
}
function checkContentIsObject(event, error) {
  if (typeof event.content === "object") {
    const contentPreview = JSON.stringify(event.content, null, 2).substring(0, 200);
    error(
      "event-content-is-object",
      `Event content is an object. Content must be a string.

\u{1F4E6} Your content (${typeof event.content}):
${contentPreview}${JSON.stringify(event.content).length > 200 ? "..." : ""}

\u274C event.content = { ... }  // WRONG
\u2705 event.content = JSON.stringify({ ... })  // CORRECT`,
      "Use JSON.stringify() for structured data: event.content = JSON.stringify(data)",
      false
      // Fatal error - cannot be disabled
    );
  }
}
function checkCreatedAtMilliseconds(event, error) {
  if (event.created_at && event.created_at > 1e10) {
    const correctValue = Math.floor(event.created_at / 1e3);
    const dateString = new Date(event.created_at).toISOString();
    error(
      "event-created-at-milliseconds",
      `Event created_at is in milliseconds, not seconds.

\u{1F4E6} Your value:
   \u2022 created_at: ${event.created_at} \u274C
   \u2022 Interpreted as: ${dateString}
   \u2022 Should be: ${correctValue} \u2705

Nostr timestamps MUST be in seconds since Unix epoch.`,
      "Use Math.floor(Date.now() / 1000) instead of Date.now()",
      false
      // Fatal error - cannot be disabled
    );
  }
}
function checkInvalidPTags(event, error) {
  const pTags = event.getMatchingTags("p");
  pTags.forEach((tag, idx) => {
    if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
      const tagPreview = JSON.stringify(tag);
      error(
        "tag-invalid-p-tag",
        `p-tag[${idx}] has invalid pubkey.

\u{1F4E6} Your tag:
   ${tagPreview}

\u274C Invalid value: "${tag[1]}"
   \u2022 Length: ${tag[1].length} (expected 64)
   \u2022 Format: ${tag[1].startsWith("npub") ? "bech32 (npub)" : "unknown"}

p-tags MUST contain 64-character hex pubkeys.`,
        tag[1].startsWith("npub") ? "Use ndkUser.pubkey instead of npub:\n   \u2705 event.tags.push(['p', ndkUser.pubkey])\n   \u274C event.tags.push(['p', 'npub1...'])" : "p-tags must contain valid hex pubkeys (64 characters, 0-9a-f)",
        false
        // Fatal error - cannot be disabled
      );
    }
  });
}
function checkInvalidETags(event, error) {
  const eTags = event.getMatchingTags("e");
  eTags.forEach((tag, idx) => {
    if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
      const tagPreview = JSON.stringify(tag);
      const isBech32 = tag[1].startsWith("note") || tag[1].startsWith("nevent");
      error(
        "tag-invalid-e-tag",
        `e-tag[${idx}] has invalid event ID.

\u{1F4E6} Your tag:
   ${tagPreview}

\u274C Invalid value: "${tag[1]}"
   \u2022 Length: ${tag[1].length} (expected 64)
   \u2022 Format: ${isBech32 ? "bech32 (note/nevent)" : "unknown"}

e-tags MUST contain 64-character hex event IDs.`,
        isBech32 ? "Use event.id instead of bech32:\n   \u2705 event.tags.push(['e', referencedEvent.id])\n   \u274C event.tags.push(['e', 'note1...'])" : "e-tags must contain valid hex event IDs (64 characters, 0-9a-f)",
        false
        // Fatal error - cannot be disabled
      );
    }
  });
}
function checkManualReplyMarkers(event, warn, replyEvents) {
  if (event.kind !== 1) return;
  if (replyEvents.has(event)) return;
  const eTagsWithMarkers = event.tags.filter((tag) => tag[0] === "e" && (tag[3] === "reply" || tag[3] === "root"));
  if (eTagsWithMarkers.length > 0) {
    const tagList = eTagsWithMarkers.map((tag, idx) => `   ${idx + 1}. ${JSON.stringify(tag)}`).join("\n");
    warn(
      "event-manual-reply-markers",
      `Event has ${eTagsWithMarkers.length} e-tag(s) with manual reply/root markers.

\u{1F4E6} Your tags with markers:
${tagList}

\u26A0\uFE0F  Manual reply markers detected! This will cause incorrect threading.`,
      `Reply events MUST be created using .reply():

   \u2705 CORRECT:
   const replyEvent = originalEvent.reply();
   replyEvent.content = 'good point!';
   await replyEvent.publish();

   \u274C WRONG:
   event.tags.push(['e', eventId, '', 'reply']);

NDK handles all reply threading automatically - never add reply/root markers manually.`
    );
  }
}
function checkHashtagsWithPrefix(event, error) {
  const tTags = event.getMatchingTags("t");
  tTags.forEach((tag, idx) => {
    if (tag[1] && tag[1].startsWith("#")) {
      const tagPreview = JSON.stringify(tag);
      error(
        "tag-hashtag-with-prefix",
        `t-tag[${idx}] contains hashtag with # prefix.

\u{1F4E6} Your tag:
   ${tagPreview}

\u274C Invalid value: "${tag[1]}"

Hashtag tags should NOT include the # symbol.`,
        `Remove the # prefix from hashtag tags:
   \u2705 event.tags.push(['t', 'nostr'])
   \u274C event.tags.push(['t', '#nostr'])`,
        false
        // Fatal error - cannot be disabled
      );
    }
  });
}
function checkReplaceableWithOldTimestamp(event, warn) {
  if (event.kind === void 0 || event.kind === null || !event.created_at) return;
  if (!event.isReplaceable()) return;
  const nowSeconds = Math.floor(Date.now() / 1e3);
  const ageSeconds = nowSeconds - event.created_at;
  const TEN_SECONDS = 10;
  if (ageSeconds > TEN_SECONDS) {
    const ageMinutes = Math.floor(ageSeconds / 60);
    const ageDescription = ageMinutes > 0 ? `${ageMinutes} minute${ageMinutes !== 1 ? "s" : ""}` : `${ageSeconds} seconds`;
    warn(
      "event-replaceable-old-timestamp",
      `Publishing a replaceable event with an old created_at timestamp.

\u{1F4E6} Event details:
   \u2022 kind: ${event.kind} (replaceable)
   \u2022 created_at: ${event.created_at}
   \u2022 age: ${ageDescription} old
   \u2022 current time: ${nowSeconds}

\u26A0\uFE0F  This is wrong and will be rejected by relays.`,
      `For replaceable events, use publishReplaceable():

   \u2705 CORRECT:
   await event.publishReplaceable();
   // Automatically updates created_at to now

   \u274C WRONG:
   await event.publish();
   // Uses old created_at`
    );
  }
}
function signing(event, error, warn, replyEvents) {
  checkMissingKind(event, error);
  checkContentIsObject(event, error);
  checkCreatedAtMilliseconds(event, error);
  checkInvalidPTags(event, error);
  checkInvalidETags(event, error);
  checkHashtagsWithPrefix(event, error);
  checkManualReplyMarkers(event, warn, replyEvents);
}
function publishing(event, warn) {
  checkReplaceableWithOldTimestamp(event, warn);
}
function isNip33Pattern(filters) {
  const filterArray = Array.isArray(filters) ? filters : [filters];
  if (filterArray.length !== 1) return false;
  const filter = filterArray[0];
  return filter.kinds && Array.isArray(filter.kinds) && filter.kinds.length === 1 && filter.authors && Array.isArray(filter.authors) && filter.authors.length === 1 && filter["#d"] && Array.isArray(filter["#d"]) && filter["#d"].length === 1;
}
function isReplaceableEventFilter(filters) {
  const filterArray = Array.isArray(filters) ? filters : [filters];
  if (filterArray.length === 0) {
    return false;
  }
  return filterArray.every((filter) => {
    if (!filter.kinds || !Array.isArray(filter.kinds) || filter.kinds.length === 0) {
      return false;
    }
    if (!filter.authors || !Array.isArray(filter.authors) || filter.authors.length === 0) {
      return false;
    }
    const allKindsReplaceable = filter.kinds.every((kind) => {
      return kind === 0 || kind === 3 || kind >= 1e4 && kind <= 19999;
    });
    return allKindsReplaceable;
  });
}
function formatFilter(filter) {
  const formatted = JSON.stringify(filter, null, 2);
  return formatted.split("\n").map((line, idx) => idx === 0 ? line : `   ${line}`).join("\n");
}
function fetchingEvents(filters, opts, warn, shouldWarnRatio, incrementCount) {
  incrementCount();
  if (opts?.cacheUsage === "ONLY_CACHE") {
    return;
  }
  const filterArray = Array.isArray(filters) ? filters : [filters];
  const formattedFilters = filterArray.map(formatFilter).join("\n\n   ---\n\n   ");
  if (isNip33Pattern(filters)) {
    const filter = filterArray[0];
    warn(
      "fetch-events-usage",
      "For fetching a NIP-33 addressable event, use fetchEvent() with the naddr directly.\n\n\u{1F4E6} Your filter:\n   " + formattedFilters + `

  \u274C BAD:  const decoded = nip19.decode(naddr);
           const events = await ndk.fetchEvents({
             kinds: [decoded.data.kind],
             authors: [decoded.data.pubkey],
             "#d": [decoded.data.identifier]
           });
           const event = Array.from(events)[0];

  \u2705 GOOD: const event = await ndk.fetchEvent(naddr);
  \u2705 GOOD: const event = await ndk.fetchEvent('naddr1...');

fetchEvent() handles naddr decoding automatically and returns the event directly.`
    );
  } else if (isReplaceableEventFilter(filters)) {
    return;
  } else {
    if (!shouldWarnRatio()) {
      return;
    }
    let filterAnalysis = "";
    const hasLimit = filterArray.some((f) => f.limit !== void 0);
    const totalKinds = new Set(filterArray.flatMap((f) => f.kinds || [])).size;
    const totalAuthors = new Set(filterArray.flatMap((f) => f.authors || [])).size;
    if (hasLimit) {
      const maxLimit = Math.max(...filterArray.map((f) => f.limit || 0));
      filterAnalysis += `
   \u2022 Limit: ${maxLimit} event${maxLimit !== 1 ? "s" : ""}`;
    }
    if (totalKinds > 0) {
      filterAnalysis += `
   \u2022 Kinds: ${totalKinds} type${totalKinds !== 1 ? "s" : ""}`;
    }
    if (totalAuthors > 0) {
      filterAnalysis += `
   \u2022 Authors: ${totalAuthors} author${totalAuthors !== 1 ? "s" : ""}`;
    }
    warn(
      "fetch-events-usage",
      "fetchEvents() is a BLOCKING operation that waits for EOSE.\nIn most cases, you should use subscribe() instead.\n\n\u{1F4E6} Your filter" + (filterArray.length > 1 ? "s" : "") + ":\n   " + formattedFilters + (filterAnalysis ? "\n\n\u{1F4CA} Filter analysis:" + filterAnalysis : "") + "\n\n  \u274C BAD:  const events = await ndk.fetchEvents(filter);\n  \u2705 GOOD: ndk.subscribe(filter, { onEvent: (e) => ... });\n\nOnly use fetchEvents() when you MUST block until data arrives.",
      "For one-time queries, use fetchEvent() instead of fetchEvents() when expecting a single result."
    );
  }
}
var GuardrailCheckId = {
  // NDK lifecycle
  NDK_NO_CACHE: "ndk-no-cache",
  // Filter-related
  FILTER_BECH32_IN_ARRAY: "filter-bech32-in-array",
  FILTER_INVALID_HEX: "filter-invalid-hex",
  FILTER_ONLY_LIMIT: "filter-only-limit",
  FILTER_LARGE_LIMIT: "filter-large-limit",
  FILTER_EMPTY: "filter-empty",
  FILTER_SINCE_AFTER_UNTIL: "filter-since-after-until",
  FILTER_INVALID_A_TAG: "filter-invalid-a-tag",
  FILTER_HASHTAG_WITH_PREFIX: "filter-hashtag-with-prefix",
  // fetchEvents anti-pattern
  FETCH_EVENTS_USAGE: "fetch-events-usage",
  // Event construction
  EVENT_MISSING_KIND: "event-missing-kind",
  EVENT_PARAM_REPLACEABLE_NO_DTAG: "event-param-replaceable-no-dtag",
  EVENT_CREATED_AT_MILLISECONDS: "event-created-at-milliseconds",
  EVENT_NO_NDK_INSTANCE: "event-no-ndk-instance",
  EVENT_CONTENT_IS_OBJECT: "event-content-is-object",
  EVENT_MODIFIED_AFTER_SIGNING: "event-modified-after-signing",
  EVENT_MANUAL_REPLY_MARKERS: "event-manual-reply-markers",
  // Tag construction
  TAG_E_FOR_PARAM_REPLACEABLE: "tag-e-for-param-replaceable",
  TAG_BECH32_VALUE: "tag-bech32-value",
  TAG_DUPLICATE: "tag-duplicate",
  TAG_INVALID_P_TAG: "tag-invalid-p-tag",
  TAG_INVALID_E_TAG: "tag-invalid-e-tag",
  TAG_HASHTAG_WITH_PREFIX: "tag-hashtag-with-prefix",
  // Subscription
  SUBSCRIBE_NOT_STARTED: "subscribe-not-started",
  SUBSCRIBE_CLOSE_ON_EOSE_NO_HANDLER: "subscribe-close-on-eose-no-handler",
  SUBSCRIBE_PASSED_EVENT_NOT_FILTER: "subscribe-passed-event-not-filter",
  SUBSCRIBE_AWAITED: "subscribe-awaited",
  // Relay
  RELAY_INVALID_URL: "relay-invalid-url",
  RELAY_HTTP_INSTEAD_OF_WS: "relay-http-instead-of-ws",
  RELAY_NO_ERROR_HANDLERS: "relay-no-error-handlers",
  // Validation
  VALIDATION_PUBKEY_IS_NPUB: "validation-pubkey-is-npub",
  VALIDATION_PUBKEY_WRONG_LENGTH: "validation-pubkey-wrong-length",
  VALIDATION_EVENT_ID_IS_BECH32: "validation-event-id-is-bech32",
  VALIDATION_EVENT_ID_WRONG_LENGTH: "validation-event-id-wrong-length"
};
function checkCachePresence(ndk, shouldCheck) {
  if (!shouldCheck(GuardrailCheckId.NDK_NO_CACHE)) return;
  setTimeout(() => {
    if (!ndk.cacheAdapter) {
      const isBrowser = typeof window !== "undefined";
      const suggestion = isBrowser ? "Consider using @nostr-dev-kit/ndk-cache-dexie or @nostr-dev-kit/ndk-cache-sqlite-wasm" : "Consider using @nostr-dev-kit/ndk-cache-redis or @nostr-dev-kit/ndk-cache-sqlite";
      const message = `
\u{1F916} AI_GUARDRAILS WARNING: NDK initialized without a cache adapter. Apps perform significantly better with caching.

\u{1F4A1} ${suggestion}

\u{1F507} To disable this check:
   ndk.aiGuardrails.skip('${GuardrailCheckId.NDK_NO_CACHE}')
   or set: ndk.aiGuardrails = { skip: new Set(['${GuardrailCheckId.NDK_NO_CACHE}']) }`;
      console.warn(message);
    }
  }, 2500);
}
var AIGuardrails = class {
  enabled = false;
  skipSet = /* @__PURE__ */ new Set();
  extensions = /* @__PURE__ */ new Map();
  _nextCallDisabled = null;
  _replyEvents = /* @__PURE__ */ new WeakSet();
  _fetchEventsCount = 0;
  _subscribeCount = 0;
  constructor(mode = false) {
    this.setMode(mode);
  }
  /**
   * Register an extension namespace with custom guardrail hooks.
   * This allows external packages to add their own guardrails.
   *
   * @example
   * ```typescript
   * // In NDKSvelte package:
   * ndk.aiGuardrails.register('ndkSvelte', {
   *   constructing: (params) => {
   *     if (!params.session) {
   *       warn('ndksvelte-no-session', 'NDKSvelte instantiated without session parameter...');
   *     }
   *   }
   * });
   *
   * // In NDKSvelte constructor:
   * this.ndk.aiGuardrails?.ndkSvelte?.constructing(params);
   * ```
   */
  register(namespace, hooks) {
    if (this.extensions.has(namespace)) {
      console.warn(`AIGuardrails: Extension '${namespace}' already registered, overwriting`);
    }
    const wrappedHooks = {};
    for (const [key, fn] of Object.entries(hooks)) {
      if (typeof fn === "function") {
        wrappedHooks[key] = (...args) => {
          if (!this.enabled) return;
          fn(...args, this.shouldCheck.bind(this), this.error.bind(this), this.warn.bind(this));
        };
      }
    }
    this.extensions.set(namespace, wrappedHooks);
    this[namespace] = wrappedHooks;
  }
  /**
   * Set the guardrails mode.
   */
  setMode(mode) {
    if (typeof mode === "boolean") {
      this.enabled = mode;
      this.skipSet.clear();
    } else if (mode && typeof mode === "object") {
      this.enabled = true;
      this.skipSet = mode.skip || /* @__PURE__ */ new Set();
    }
  }
  /**
   * Check if guardrails are enabled at all.
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Check if a specific guardrail check should run.
   */
  shouldCheck(id) {
    if (!this.enabled) return false;
    if (this.skipSet.has(id)) return false;
    if (this._nextCallDisabled === "all") return false;
    if (this._nextCallDisabled && this._nextCallDisabled.has(id)) return false;
    return true;
  }
  /**
   * Disable a specific guardrail check.
   */
  skip(id) {
    this.skipSet.add(id);
  }
  /**
   * Re-enable a specific guardrail check.
   */
  enable(id) {
    this.skipSet.delete(id);
  }
  /**
   * Get all currently skipped guardrails.
   */
  getSkipped() {
    return Array.from(this.skipSet);
  }
  /**
   * Capture the current _nextCallDisabled set and clear it atomically.
   * This is used by hook methods to handle one-time guardrail disabling.
   */
  captureAndClearNextCallDisabled() {
    const captured = this._nextCallDisabled;
    this._nextCallDisabled = null;
    return captured;
  }
  /**
   * Increment fetchEvents call counter for ratio tracking.
   */
  incrementFetchEventsCount() {
    this._fetchEventsCount++;
  }
  /**
   * Increment subscribe call counter for ratio tracking.
   */
  incrementSubscribeCount() {
    this._subscribeCount++;
  }
  /**
   * Check if fetchEvents usage ratio exceeds the threshold.
   * Returns true if more than 50% of calls are fetchEvents AND total calls > 6.
   */
  shouldWarnAboutFetchEventsRatio() {
    const totalCalls = this._fetchEventsCount + this._subscribeCount;
    if (totalCalls <= 6) {
      return false;
    }
    const ratio = this._fetchEventsCount / totalCalls;
    return ratio > 0.5;
  }
  /**
   * Throw an error if the check should run.
   * Also logs to console.error in case the throw gets swallowed.
   * @param canDisable - If false, this is a fatal error that cannot be disabled (default: true)
   */
  error(id, message, hint, canDisable = true) {
    if (!this.shouldCheck(id)) return;
    const fullMessage = this.formatMessage(id, "ERROR", message, hint, canDisable);
    console.error(fullMessage);
    throw new Error(fullMessage);
  }
  /**
   * Throw a warning if the check should run.
   * Also logs to console.error in case the throw gets swallowed.
   * Warnings can always be disabled.
   */
  warn(id, message, hint) {
    if (!this.shouldCheck(id)) return;
    const fullMessage = this.formatMessage(id, "WARNING", message, hint, true);
    console.error(fullMessage);
    throw new Error(fullMessage);
  }
  /**
   * Format a guardrail message with helpful metadata.
   */
  formatMessage(id, level, message, hint, canDisable = true) {
    let output = `
\u{1F916} AI_GUARDRAILS ${level}: ${message}`;
    if (hint) {
      output += `

\u{1F4A1} ${hint}`;
    }
    if (canDisable) {
      output += `

\u{1F507} To disable this check:
   ndk.guardrailOff('${id}').yourMethod()  // For one call`;
      output += `
   ndk.aiGuardrails.skip('${id}')  // Permanently`;
      output += `
   or set: ndk.aiGuardrails = { skip: new Set(['${id}']) }`;
    }
    return output;
  }
  // ============================================================================
  // Hook Methods - Type-safe, domain-organized insertion points
  // ============================================================================
  /**
   * Called when NDK instance is created.
   * Checks for cache presence and other initialization concerns.
   */
  ndkInstantiated(ndk) {
    if (!this.enabled) return;
    checkCachePresence(ndk, this.shouldCheck.bind(this));
  }
  /**
   * NDK-related guardrails
   */
  ndk = {
    /**
     * Called when fetchEvents is about to be called
     */
    fetchingEvents: (filters, opts) => {
      if (!this.enabled) return;
      fetchingEvents(
        filters,
        opts,
        this.warn.bind(this),
        this.shouldWarnAboutFetchEventsRatio.bind(this),
        this.incrementFetchEventsCount.bind(this)
      );
    }
  };
  /**
   * Event-related guardrails
   */
  event = {
    /**
     * Called when an event is about to be signed
     */
    signing: (event) => {
      if (!this.enabled) return;
      signing(event, this.error.bind(this), this.warn.bind(this), this._replyEvents);
    },
    /**
     * Called before an event is published
     */
    publishing: (event) => {
      if (!this.enabled) return;
      publishing(event, this.warn.bind(this));
    },
    /**
     * Called when an event is received from a relay
     */
    received: (_event, _relay) => {
      if (!this.enabled) return;
    },
    /**
     * Called when a reply event is being created via .reply()
     * This allows guardrails to track legitimate reply events
     */
    creatingReply: (event) => {
      if (!this.enabled) return;
      this._replyEvents.add(event);
    }
  };
  /**
   * Subscription-related guardrails
   */
  subscription = {
    /**
     * Called when a subscription is created
     */
    created: (_filters, _opts) => {
      if (!this.enabled) return;
      this.incrementSubscribeCount();
    }
  };
  /**
   * Relay-related guardrails
   */
  relay = {
    /**
     * Called when a relay connection is established
     */
    connected: (_relay) => {
      if (!this.enabled) return;
    }
  };
};
var NDKFilterValidationMode = /* @__PURE__ */ ((NDKFilterValidationMode2) => {
  NDKFilterValidationMode2["VALIDATE"] = "validate";
  NDKFilterValidationMode2["FIX"] = "fix";
  NDKFilterValidationMode2["IGNORE"] = "ignore";
  return NDKFilterValidationMode2;
})(NDKFilterValidationMode || {});
function processFilters(filters, mode = "validate", debug9, ndk) {
  if (mode === "ignore") {
    return filters;
  }
  const issues = [];
  const processedFilters = filters.map((filter, index) => {
    if (ndk?.aiGuardrails.isEnabled()) {
      runAIGuardrailsForFilter(filter, index, ndk);
    }
    const result = processFilter(filter, mode, index, issues, debug9);
    return result;
  });
  if (mode === "validate" && issues.length > 0) {
    throw new Error(`Invalid filter(s) detected:
${issues.join("\n")}`);
  }
  return processedFilters;
}
function processFilter(filter, mode, filterIndex, issues, debug9) {
  const isValidating = mode === "validate";
  const cleanedFilter = isValidating ? filter : { ...filter };
  if (filter.ids) {
    const validIds = [];
    filter.ids.forEach((id, idx) => {
      if (id === void 0) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at ids[${idx}]`);
        }
      } else if (typeof id !== "string") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is not a string (got ${typeof id})`);
        } else {
          debug9?.(`Fixed: Removed non-string value at ids[${idx}] (was ${typeof id})`);
        }
      } else if (!isValidHex64(id)) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is not a valid 64-char hex string: "${id}"`);
        } else {
          debug9?.(`Fixed: Removed invalid hex string at ids[${idx}]`);
        }
      } else {
        validIds.push(id);
      }
    });
    if (!isValidating) {
      cleanedFilter.ids = validIds.length > 0 ? validIds : void 0;
    }
  }
  if (filter.authors) {
    const validAuthors = [];
    filter.authors.forEach((author, idx) => {
      if (author === void 0) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].authors[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at authors[${idx}]`);
        }
      } else if (typeof author !== "string") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].authors[${idx}] is not a string (got ${typeof author})`);
        } else {
          debug9?.(`Fixed: Removed non-string value at authors[${idx}] (was ${typeof author})`);
        }
      } else if (!isValidHex64(author)) {
        if (isValidating) {
          issues.push(
            `Filter[${filterIndex}].authors[${idx}] is not a valid 64-char hex pubkey: "${author}"`
          );
        } else {
          debug9?.(`Fixed: Removed invalid hex pubkey at authors[${idx}]`);
        }
      } else {
        validAuthors.push(author);
      }
    });
    if (!isValidating) {
      cleanedFilter.authors = validAuthors.length > 0 ? validAuthors : void 0;
    }
  }
  if (filter.kinds) {
    const validKinds = [];
    filter.kinds.forEach((kind, idx) => {
      if (kind === void 0) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at kinds[${idx}]`);
        }
      } else if (typeof kind !== "number") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is not a number (got ${typeof kind})`);
        } else {
          debug9?.(`Fixed: Removed non-number value at kinds[${idx}] (was ${typeof kind})`);
        }
      } else if (!Number.isInteger(kind)) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is not an integer: ${kind}`);
        } else {
          debug9?.(`Fixed: Removed non-integer value at kinds[${idx}]: ${kind}`);
        }
      } else if (kind < 0 || kind > 65535) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is out of valid range (0-65535): ${kind}`);
        } else {
          debug9?.(`Fixed: Removed out-of-range kind at kinds[${idx}]: ${kind}`);
        }
      } else {
        validKinds.push(kind);
      }
    });
    if (!isValidating) {
      cleanedFilter.kinds = validKinds.length > 0 ? validKinds : void 0;
    }
  }
  for (const key in filter) {
    if (key.startsWith("#") && key.length === 2) {
      const tagValues = filter[key];
      if (Array.isArray(tagValues)) {
        const validValues = [];
        tagValues.forEach((value, idx) => {
          if (value === void 0) {
            if (isValidating) {
              issues.push(`Filter[${filterIndex}].${key}[${idx}] is undefined`);
            } else {
              debug9?.(`Fixed: Removed undefined value at ${key}[${idx}]`);
            }
          } else if (typeof value !== "string") {
            if (isValidating) {
              issues.push(`Filter[${filterIndex}].${key}[${idx}] is not a string (got ${typeof value})`);
            } else {
              debug9?.(`Fixed: Removed non-string value at ${key}[${idx}] (was ${typeof value})`);
            }
          } else {
            if ((key === "#e" || key === "#p") && !isValidHex64(value)) {
              if (isValidating) {
                issues.push(
                  `Filter[${filterIndex}].${key}[${idx}] is not a valid 64-char hex string: "${value}"`
                );
              } else {
                debug9?.(`Fixed: Removed invalid hex string at ${key}[${idx}]`);
              }
            } else {
              validValues.push(value);
            }
          }
        });
        if (!isValidating) {
          cleanedFilter[key] = validValues.length > 0 ? validValues : void 0;
        }
      }
    }
  }
  if (!isValidating) {
    Object.keys(cleanedFilter).forEach((key) => {
      if (cleanedFilter[key] === void 0) {
        delete cleanedFilter[key];
      }
    });
  }
  return cleanedFilter;
}
function runAIGuardrailsForFilter(filter, filterIndex, ndk) {
  const guards = ndk.aiGuardrails;
  const filterPreview = JSON.stringify(filter, null, 2);
  if (Object.keys(filter).length === 1 && filter.limit !== void 0) {
    guards.error(
      GuardrailCheckId.FILTER_ONLY_LIMIT,
      `Filter[${filterIndex}] contains only 'limit' without any filtering criteria.

\u{1F4E6} Your filter:
${filterPreview}

\u26A0\uFE0F  This will fetch random events from relays without any criteria.`,
      `Add filtering criteria:
   \u2705 { kinds: [1], limit: 10 }
   \u2705 { authors: [pubkey], limit: 10 }
   \u274C { limit: 10 }`
    );
  }
  if (Object.keys(filter).length === 0) {
    guards.error(
      GuardrailCheckId.FILTER_EMPTY,
      `Filter[${filterIndex}] is empty.

\u{1F4E6} Your filter:
${filterPreview}

\u26A0\uFE0F  This will request ALL events from relays, which is never what you want.`,
      `Add filtering criteria like 'kinds', 'authors', or tags.`,
      false
      // Fatal error - cannot be disabled
    );
  }
  if (filter.since !== void 0 && filter.until !== void 0 && filter.since > filter.until) {
    const sinceDate = new Date(filter.since * 1e3).toISOString();
    const untilDate = new Date(filter.until * 1e3).toISOString();
    guards.error(
      GuardrailCheckId.FILTER_SINCE_AFTER_UNTIL,
      `Filter[${filterIndex}] has 'since' AFTER 'until'.

\u{1F4E6} Your filter:
${filterPreview}

\u274C since: ${filter.since} (${sinceDate})
\u274C until: ${filter.until} (${untilDate})

No events can match this time range!`,
      `'since' must be BEFORE 'until'. Both are Unix timestamps in seconds.`,
      false
      // Fatal error - cannot be disabled
    );
  }
  const bech32Regex = /^n(addr|event|ote|pub|profile)1/;
  if (filter.ids) {
    filter.ids.forEach((id, idx) => {
      if (typeof id === "string") {
        if (bech32Regex.test(id)) {
          guards.error(
            GuardrailCheckId.FILTER_BECH32_IN_ARRAY,
            `Filter[${filterIndex}].ids[${idx}] contains bech32: "${id}". IDs must be hex, not bech32.`,
            `Use filterFromId() to decode bech32 first: import { filterFromId } from "@nostr-dev-kit/ndk"`,
            false
            // Fatal error - cannot be disabled
          );
        } else if (!isValidHex64(id)) {
          guards.error(
            GuardrailCheckId.FILTER_INVALID_HEX,
            `Filter[${filterIndex}].ids[${idx}] is not a valid 64-char hex string: "${id}"`,
            `Event IDs must be 64-character hexadecimal strings. Invalid IDs often come from corrupted data in user-generated lists. Always validate hex strings before using them in filters:

   const validIds = ids.filter(id => /^[0-9a-f]{64}$/i.test(id));`,
            false
            // Fatal error - cannot be disabled
          );
        }
      }
    });
  }
  if (filter.authors) {
    filter.authors.forEach((author, idx) => {
      if (typeof author === "string") {
        if (bech32Regex.test(author)) {
          guards.error(
            GuardrailCheckId.FILTER_BECH32_IN_ARRAY,
            `Filter[${filterIndex}].authors[${idx}] contains bech32: "${author}". Authors must be hex pubkeys, not npub.`,
            `Use ndkUser.pubkey instead. Example: { authors: [ndkUser.pubkey] }`,
            false
            // Fatal error - cannot be disabled
          );
        } else if (!isValidHex64(author)) {
          guards.error(
            GuardrailCheckId.FILTER_INVALID_HEX,
            `Filter[${filterIndex}].authors[${idx}] is not a valid 64-char hex pubkey: "${author}"`,
            `Kind:3 follow lists can contain invalid entries like labels ("Follow List"), partial strings ("highlig"), or other corrupted data. You MUST validate all pubkeys before using them in filters.

   Example:
   const validPubkeys = pubkeys.filter(p => /^[0-9a-f]{64}$/i.test(p));
   ndk.subscribe({ authors: validPubkeys, kinds: [1] });`,
            false
            // Fatal error - cannot be disabled
          );
        }
      }
    });
  }
  for (const key in filter) {
    if (key.startsWith("#") && key.length === 2) {
      const tagValues = filter[key];
      if (Array.isArray(tagValues)) {
        tagValues.forEach((value, idx) => {
          if (typeof value === "string") {
            if (key === "#e" || key === "#p") {
              if (bech32Regex.test(value)) {
                guards.error(
                  GuardrailCheckId.FILTER_BECH32_IN_ARRAY,
                  `Filter[${filterIndex}].${key}[${idx}] contains bech32: "${value}". Tag values must be decoded.`,
                  `Use filterFromId() or nip19.decode() to get the hex value first.`,
                  false
                  // Fatal error - cannot be disabled
                );
              } else if (!isValidHex64(value)) {
                guards.error(
                  GuardrailCheckId.FILTER_INVALID_HEX,
                  `Filter[${filterIndex}].${key}[${idx}] is not a valid 64-char hex string: "${value}"`,
                  `${key === "#e" ? "Event IDs" : "Public keys"} in tag filters must be 64-character hexadecimal strings. Kind:3 follow lists and other user-generated content can contain invalid data. Always filter before using:

   const validValues = values.filter(v => /^[0-9a-f]{64}$/i.test(v));`,
                  false
                  // Fatal error - cannot be disabled
                );
              }
            }
          }
        });
      }
    }
  }
  if (filter["#a"]) {
    const aTags = filter["#a"];
    aTags?.forEach((aTag, idx) => {
      if (typeof aTag === "string") {
        if (!/^\d+:[0-9a-f]{64}:.*$/.test(aTag)) {
          guards.error(
            GuardrailCheckId.FILTER_INVALID_A_TAG,
            `Filter[${filterIndex}].#a[${idx}] has invalid format: "${aTag}". Must be "kind:pubkey:d-tag".`,
            `Example: "30023:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:my-article"`,
            false
            // Fatal error - cannot be disabled
          );
        } else {
          const kind = Number.parseInt(aTag.split(":")[0], 10);
          if (kind < 3e4 || kind > 39999) {
            guards.error(
              GuardrailCheckId.FILTER_INVALID_A_TAG,
              `Filter[${filterIndex}].#a[${idx}] uses non-addressable kind ${kind}: "${aTag}". #a filters are only for addressable events (kinds 30000-39999).`,
              `Addressable events include:
   \u2022 30000-30039: Parameterized Replaceable Events (profiles, settings, etc.)
   \u2022 30040-39999: Other addressable events

For regular events (kind ${kind}), use:
   \u2022 #e filter for specific event IDs
   \u2022 kinds + authors filters for event queries`,
              false
              // Fatal error - cannot be disabled
            );
          }
        }
      }
    });
  }
  if (filter["#t"]) {
    const tTags = filter["#t"];
    tTags?.forEach((tag, idx) => {
      if (typeof tag === "string" && tag.startsWith("#")) {
        guards.error(
          GuardrailCheckId.FILTER_HASHTAG_WITH_PREFIX,
          `Filter[${filterIndex}].#t[${idx}] contains hashtag with # prefix: "${tag}". Hashtag values should NOT include the # symbol.`,
          `Remove the # prefix from hashtag filters:
   \u2705 { "#t": ["nostr"] }
   \u274C { "#t": ["#nostr"] }`,
          false
          // Fatal error - cannot be disabled
        );
      }
    });
  }
}
var MAX_SUBID_LENGTH = 20;
function queryFullyFilled(subscription) {
  if (filterIncludesIds(subscription.filter)) {
    if (resultHasAllRequestedIds(subscription)) {
      return true;
    }
  }
  return false;
}
function compareFilter(filter1, filter2) {
  if (Object.keys(filter1).length !== Object.keys(filter2).length) return false;
  for (const [key, value] of Object.entries(filter1)) {
    const valuesInFilter2 = filter2[key];
    if (!valuesInFilter2) return false;
    if (Array.isArray(value) && Array.isArray(valuesInFilter2)) {
      const v = value;
      for (const valueInFilter2 of valuesInFilter2) {
        const val = valueInFilter2;
        if (!v.includes(val)) {
          return false;
        }
      }
    } else {
      if (valuesInFilter2 !== value) return false;
    }
  }
  return true;
}
function filterIncludesIds(filter) {
  return !!filter.ids;
}
function resultHasAllRequestedIds(subscription) {
  const ids = subscription.filter.ids;
  return !!ids && ids.length === subscription.eventFirstSeen.size;
}
function generateSubId(subscriptions, filters) {
  const subIds = subscriptions.map((sub) => sub.subId).filter(Boolean);
  const subIdParts = [];
  const filterNonKindKeys = /* @__PURE__ */ new Set();
  const filterKinds = /* @__PURE__ */ new Set();
  if (subIds.length > 0) {
    subIdParts.push(Array.from(new Set(subIds)).join(","));
  } else {
    for (const filter of filters) {
      for (const key of Object.keys(filter)) {
        if (key === "kinds") {
          filter.kinds?.forEach((k) => filterKinds.add(k));
        } else {
          filterNonKindKeys.add(key);
        }
      }
    }
    if (filterKinds.size > 0) {
      subIdParts.push(`kinds:${Array.from(filterKinds).join(",")}`);
    }
    if (filterNonKindKeys.size > 0) {
      subIdParts.push(Array.from(filterNonKindKeys).join(","));
    }
  }
  let subId = subIdParts.join("-");
  if (subId.length > MAX_SUBID_LENGTH) subId = subId.substring(0, MAX_SUBID_LENGTH);
  subId += `-${Math.floor(Math.random() * 999).toString()}`;
  return subId;
}
function filterForEventsTaggingId(id) {
  try {
    const decoded = nip19_exports.decode(id);
    switch (decoded.type) {
      case "naddr":
        return {
          "#a": [`${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`]
        };
      case "nevent":
        return { "#e": [decoded.data.id] };
      case "note":
        return { "#e": [decoded.data] };
      case "nprofile":
        return { "#p": [decoded.data.pubkey] };
      case "npub":
        return { "#p": [decoded.data] };
    }
  } catch {
  }
}
function filterAndRelaySetFromBech32(bech3222, ndk) {
  const filter = filterFromId(bech3222);
  const relays = relaysFromBech32(bech3222, ndk);
  if (relays.length === 0) return { filter };
  return {
    filter,
    relaySet: new NDKRelaySet(new Set(relays), ndk)
  };
}
function filterFromId(id) {
  let decoded;
  if (id.match(NIP33_A_REGEX)) {
    const [kind, pubkey, identifier] = id.split(":");
    const filter = {
      authors: [pubkey],
      kinds: [Number.parseInt(kind)]
    };
    if (identifier) {
      filter["#d"] = [identifier];
    }
    return filter;
  }
  if (id.match(BECH32_REGEX3)) {
    try {
      decoded = nip19_exports.decode(id);
      switch (decoded.type) {
        case "nevent": {
          const filter = { ids: [decoded.data.id] };
          if (decoded.data.author) filter.authors = [decoded.data.author];
          if (decoded.data.kind) filter.kinds = [decoded.data.kind];
          return filter;
        }
        case "note":
          return { ids: [decoded.data] };
        case "naddr": {
          const filter = {
            authors: [decoded.data.pubkey],
            kinds: [decoded.data.kind]
          };
          if (decoded.data.identifier) filter["#d"] = [decoded.data.identifier];
          return filter;
        }
      }
    } catch (e) {
      console.error("Error decoding", id, e);
    }
  }
  return { ids: [id] };
}
function isNip33AValue(value) {
  return value.match(NIP33_A_REGEX) !== null;
}
var NIP33_A_REGEX = /^(\d+):([0-9A-Fa-f]+)(?::(.*))?$/;
var BECH32_REGEX3 = /^n(event|ote|profile|pub|addr)1[\d\w]+$/;
function relaysFromBech32(bech3222, ndk) {
  try {
    const decoded = nip19_exports.decode(bech3222);
    if (["naddr", "nevent"].includes(decoded?.type)) {
      const data = decoded.data;
      if (data?.relays) {
        return data.relays.map((r) => new NDKRelay(r, ndk.relayAuthDefaultPolicy, ndk));
      }
    }
  } catch (_e) {
  }
  return [];
}
var NDKSubscriptionCacheUsage = /* @__PURE__ */ ((NDKSubscriptionCacheUsage2) => {
  NDKSubscriptionCacheUsage2["ONLY_CACHE"] = "ONLY_CACHE";
  NDKSubscriptionCacheUsage2["CACHE_FIRST"] = "CACHE_FIRST";
  NDKSubscriptionCacheUsage2["PARALLEL"] = "PARALLEL";
  NDKSubscriptionCacheUsage2["ONLY_RELAY"] = "ONLY_RELAY";
  return NDKSubscriptionCacheUsage2;
})(NDKSubscriptionCacheUsage || {});
var defaultOpts = {
  closeOnEose: false,
  cacheUsage: "CACHE_FIRST",
  dontSaveToCache: false,
  groupable: true,
  groupableDelay: 10,
  groupableDelayType: "at-most",
  cacheUnconstrainFilter: ["limit", "since", "until"],
  includeMuted: false
};
var NDKSubscription = class extends import_tseep4.EventEmitter {
  subId;
  filters;
  opts;
  pool;
  skipVerification = false;
  skipValidation = false;
  exclusiveRelay = false;
  /**
   * Tracks the filters as they are executed on each relay
   */
  relayFilters;
  relaySet;
  ndk;
  debug;
  /**
   * Events that have been seen by the subscription, with the time they were first seen.
   */
  eventFirstSeen = /* @__PURE__ */ new Map();
  /**
   * Relays that have sent an EOSE.
   */
  eosesSeen = /* @__PURE__ */ new Set();
  /**
   * The time the last event was received by the subscription.
   * This is used to calculate when EOSE should be emitted.
   */
  lastEventReceivedAt;
  /**
   * The most recent event timestamp from cache results.
   * This is used for addSinceFromCache functionality.
   */
  mostRecentCacheEventTimestamp;
  internalId;
  /**
   * Whether the subscription should close when all relays have reached the end of the event stream.
   */
  closeOnEose;
  /**
   * Pool monitor callback
   */
  poolMonitor;
  skipOptimisticPublishEvent = false;
  /**
   * Filters to remove when querying the cache.
   */
  cacheUnconstrainFilter;
  constructor(ndk, filters, opts, subId) {
    super();
    this.ndk = ndk;
    this.opts = { ...defaultOpts, ...opts || {} };
    this.pool = this.opts.pool || ndk.pool;
    const rawFilters = Array.isArray(filters) ? filters : [filters];
    const validationMode = ndk.filterValidationMode === "validate" ? "validate" : ndk.filterValidationMode === "fix" ? "fix" : "ignore";
    this.filters = processFilters(rawFilters, validationMode, ndk.debug, ndk);
    if (this.filters.length === 0) {
      throw new Error("Subscription must have at least one filter");
    }
    this.subId = subId || this.opts.subId;
    this.internalId = Math.random().toString(36).substring(7);
    this.debug = ndk.debug.extend(`subscription[${this.opts.subId ?? this.internalId}]`);
    if (this.opts.relaySet) {
      this.relaySet = this.opts.relaySet;
    } else if (this.opts.relayUrls) {
      this.relaySet = NDKRelaySet.fromRelayUrls(this.opts.relayUrls, this.ndk);
    }
    this.skipVerification = this.opts.skipVerification || false;
    this.skipValidation = this.opts.skipValidation || false;
    this.closeOnEose = this.opts.closeOnEose || false;
    this.skipOptimisticPublishEvent = this.opts.skipOptimisticPublishEvent || false;
    this.cacheUnconstrainFilter = this.opts.cacheUnconstrainFilter;
    this.exclusiveRelay = this.opts.exclusiveRelay || false;
    if (this.opts.onEvent) {
      this.on("event", this.opts.onEvent);
    }
    if (this.opts.onEose) {
      this.on("eose", this.opts.onEose);
    }
    if (this.opts.onClose) {
      this.on("close", this.opts.onClose);
    }
  }
  /**
   * Returns the relays that have not yet sent an EOSE.
   */
  relaysMissingEose() {
    if (!this.relayFilters) return [];
    const relaysMissingEose = Array.from(this.relayFilters?.keys()).filter(
      (url) => !this.eosesSeen.has(this.pool.getRelay(url, false, false))
    );
    return relaysMissingEose;
  }
  /**
   * Provides access to the first filter of the subscription for
   * backwards compatibility.
   */
  get filter() {
    return this.filters[0];
  }
  get groupableDelay() {
    if (!this.isGroupable()) return void 0;
    return this.opts?.groupableDelay;
  }
  get groupableDelayType() {
    return this.opts?.groupableDelayType || "at-most";
  }
  isGroupable() {
    return this.opts?.groupable || false;
  }
  shouldQueryCache() {
    if (this.opts?.cacheUsage === "ONLY_RELAY") return false;
    const allFiltersEphemeralOnly = this.filters.every(
      (f) => f.kinds && f.kinds.length > 0 && f.kinds.every((k) => kindIsEphemeral(k))
    );
    if (allFiltersEphemeralOnly) return false;
    return true;
  }
  shouldQueryRelays() {
    return this.opts?.cacheUsage !== "ONLY_CACHE";
  }
  shouldWaitForCache() {
    if (this.opts.addSinceFromCache) return true;
    return (
      // Must want to close on EOSE; subscriptions
      // that want to receive further updates must
      // always hit the relay
      !!this.opts.closeOnEose && // Cache adapter must claim to be fast
      !!this.ndk.cacheAdapter?.locking && // If explicitly told to run in parallel, then
      // we should not wait for the cache
      this.opts.cacheUsage !== "PARALLEL"
    );
  }
  /**
   * Start the subscription. This is the main method that should be called
   * after creating a subscription.
   *
   * @param emitCachedEvents - Whether to emit events coming from a synchronous cache
   *
   * When using a synchronous cache, the events will be returned immediately
   * by this function. If you will use those returned events, you should
   * set emitCachedEvents to false to prevent seeing them as duplicate events.
   */
  start(emitCachedEvents = true) {
    let cacheResult;
    const updateStateFromCacheResults = (events) => {
      if (events.length === 0) {
        if (!emitCachedEvents) cacheResult = events;
        return;
      }
      if (!emitCachedEvents) {
        let maxTimestamp2 = this.mostRecentCacheEventTimestamp || 0;
        for (const event of events) {
          event.ndk = this.ndk;
          if (event.created_at && event.created_at > maxTimestamp2) {
            maxTimestamp2 = event.created_at;
          }
        }
        this.mostRecentCacheEventTimestamp = maxTimestamp2;
        cacheResult = events;
        return;
      }
      let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
      for (const event of events) {
        if (event.created_at && event.created_at > maxTimestamp) {
          maxTimestamp = event.created_at;
        }
      }
      this.mostRecentCacheEventTimestamp = maxTimestamp;
      for (const event of events) {
        this.eventReceived(event, void 0, true, false);
      }
    };
    const loadFromRelays = () => {
      if (this.shouldQueryRelays()) {
        this.startWithRelays();
        this.startPoolMonitor();
      } else {
        this.emit("eose", this);
      }
    };
    if (this.shouldQueryCache()) {
      cacheResult = this.startWithCache();
      if (cacheResult instanceof Promise) {
        if (this.shouldWaitForCache()) {
          cacheResult.then((events) => {
            if (this.opts.onEvents) {
              let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
              for (const event of events) {
                event.ndk = this.ndk;
                if (event.created_at && event.created_at > maxTimestamp) {
                  maxTimestamp = event.created_at;
                }
              }
              this.mostRecentCacheEventTimestamp = maxTimestamp;
              this.opts.onEvents(events);
            } else {
              updateStateFromCacheResults(events);
            }
            if (queryFullyFilled(this)) {
              this.emit("eose", this);
              return;
            }
            loadFromRelays();
          });
          return null;
        }
        cacheResult.then((events) => {
          if (this.opts.onEvents) {
            let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
            for (const event of events) {
              event.ndk = this.ndk;
              if (event.created_at && event.created_at > maxTimestamp) {
                maxTimestamp = event.created_at;
              }
            }
            this.mostRecentCacheEventTimestamp = maxTimestamp;
            this.opts.onEvents(events);
          } else {
            updateStateFromCacheResults(events);
          }
          if (!this.shouldQueryRelays()) {
            this.emit("eose", this);
          }
        });
        if (this.shouldQueryRelays()) {
          loadFromRelays();
        }
        return null;
      }
      updateStateFromCacheResults(cacheResult);
      if (queryFullyFilled(this)) {
        this.emit("eose", this);
      } else {
        loadFromRelays();
      }
      return cacheResult;
    }
    loadFromRelays();
    return null;
  }
  /**
   * We want to monitor for new relays that are coming online, in case
   * they should be part of this subscription.
   */
  startPoolMonitor() {
    const _d = this.debug.extend("pool-monitor");
    this.poolMonitor = (relay) => {
      if (this.relayFilters?.has(relay.url)) return;
      const calc = calculateRelaySetsFromFilters(this.ndk, this.filters, this.pool, this.opts.relayGoalPerAuthor);
      if (calc.get(relay.url)) {
        this.relayFilters?.set(relay.url, this.filters);
        relay.subscribe(this, this.filters);
      }
    };
    this.pool.on("relay:connect", this.poolMonitor);
  }
  onStopped;
  stop() {
    this.emit("close", this);
    this.poolMonitor && this.pool.off("relay:connect", this.poolMonitor);
    this.onStopped?.();
  }
  /**
   * @returns Whether the subscription has an authors filter.
   */
  hasAuthorsFilter() {
    return this.filters.some((f) => f.authors?.length);
  }
  startWithCache() {
    if (this.ndk.cacheAdapter?.query) {
      return this.ndk.cacheAdapter.query(this);
    }
    return [];
  }
  /**
   * Find available relays that should be part of this subscription and execute in them.
   *
   * Note that this is executed in addition to using the pool monitor, so even if the relay set
   * that is computed (i.e. we don't have any relays available), when relays come online, we will
   * check if we need to execute in them.
   */
  startWithRelays() {
    let filters = this.filters;
    if (this.opts.addSinceFromCache && this.mostRecentCacheEventTimestamp) {
      const sinceTimestamp = this.mostRecentCacheEventTimestamp + 1;
      filters = filters.map((filter) => ({
        ...filter,
        since: Math.max(filter.since || 0, sinceTimestamp)
      }));
    }
    if (!this.relaySet || this.relaySet.relays.size === 0) {
      this.relayFilters = calculateRelaySetsFromFilters(
        this.ndk,
        filters,
        this.pool,
        this.opts.relayGoalPerAuthor
      );
    } else {
      this.relayFilters = /* @__PURE__ */ new Map();
      for (const relay of this.relaySet.relays) {
        this.relayFilters.set(relay.url, filters);
      }
    }
    for (const [relayUrl, filters2] of this.relayFilters) {
      const relay = this.pool.getRelay(relayUrl, true, true, filters2);
      relay.subscribe(this, filters2);
    }
  }
  /**
   * Refresh relay connections when outbox data becomes available.
   * This recalculates which relays should receive this subscription and
   * connects to any newly discovered relays.
   */
  refreshRelayConnections() {
    if (this.relaySet && this.relaySet.relays.size > 0) {
      return;
    }
    const updatedRelaySets = calculateRelaySetsFromFilters(
      this.ndk,
      this.filters,
      this.pool,
      this.opts.relayGoalPerAuthor
    );
    for (const [relayUrl, filters] of updatedRelaySets) {
      if (!this.relayFilters?.has(relayUrl)) {
        this.relayFilters?.set(relayUrl, filters);
        const relay = this.pool.getRelay(relayUrl, true, true, filters);
        relay.subscribe(this, filters);
      }
    }
  }
  // EVENT handling
  /**
   * Called when an event is received from a relay or the cache
   * @param event
   * @param relay
   * @param fromCache Whether the event was received from the cache
   * @param optimisticPublish Whether this event is coming from an optimistic publish
   */
  eventReceived(event, relay, fromCache = false, optimisticPublish = false) {
    const eventId = event.id;
    const eventAlreadySeen = this.eventFirstSeen.has(eventId);
    let ndkEvent;
    if (event instanceof NDKEvent) ndkEvent = event;
    if (!eventAlreadySeen) {
      if (this.ndk.futureTimestampGrace !== void 0 && event.created_at) {
        const currentTime = Math.floor(Date.now() / 1e3);
        const timeDifference = event.created_at - currentTime;
        if (timeDifference > this.ndk.futureTimestampGrace) {
          this.debug(
            "Event discarded: timestamp %d is %d seconds in the future (grace: %d seconds)",
            event.created_at,
            timeDifference,
            this.ndk.futureTimestampGrace
          );
          return;
        }
      }
      ndkEvent ??= new NDKEvent(this.ndk, event);
      ndkEvent.ndk = this.ndk;
      ndkEvent.relay = relay;
      if (!fromCache && !optimisticPublish) {
        if (!this.skipValidation) {
          if (!ndkEvent.isValid) {
            this.debug("Event failed validation %s from relay %s", eventId, relay?.url);
            return;
          }
        }
        if (relay) {
          const shouldVerify = relay.shouldValidateEvent();
          if (shouldVerify && !this.skipVerification) {
            ndkEvent.relay = relay;
            if (this.ndk.asyncSigVerification) {
              ndkEvent.verifySignature(true);
            } else {
              if (!ndkEvent.verifySignature(true)) {
                this.debug("Event failed signature validation", event);
                this.ndk.reportInvalidSignature(ndkEvent, relay);
                return;
              }
              relay.addValidatedEvent();
            }
          } else {
            relay.addNonValidatedEvent();
          }
        }
        if (this.ndk.cacheAdapter && !this.opts.dontSaveToCache && !kindIsEphemeral(ndkEvent.kind) && !fromCache) {
          this.ndk.cacheAdapter.setEvent(ndkEvent, this.filters, relay);
        }
      }
      if (!this.opts.includeMuted && this.ndk.muteFilter && this.ndk.muteFilter(ndkEvent)) {
        this.debug("Event muted, skipping");
        return;
      }
      if (!optimisticPublish || this.skipOptimisticPublishEvent !== true) {
        this.emitEvent(this.opts?.wrap ?? false, ndkEvent, relay, fromCache, optimisticPublish);
        this.eventFirstSeen.set(eventId, Date.now());
      }
    } else {
      const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(eventId) || 0);
      this.emit("event:dup", event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);
      if (this.opts?.onEventDup) {
        this.opts.onEventDup(event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);
      }
      if (!fromCache && !optimisticPublish && relay && this.ndk.cacheAdapter?.setEventDup && !this.opts.dontSaveToCache) {
        ndkEvent ??= event instanceof NDKEvent ? event : new NDKEvent(this.ndk, event);
        this.ndk.cacheAdapter.setEventDup(ndkEvent, relay);
      }
      if (relay) {
        const signature = verifiedSignatures.get(eventId);
        if (signature && typeof signature === "string") {
          if (event.sig === signature) {
            relay.addValidatedEvent();
          } else {
            const eventToReport = event instanceof NDKEvent ? event : new NDKEvent(this.ndk, event);
            this.ndk.reportInvalidSignature(eventToReport, relay);
          }
        }
      }
    }
    this.lastEventReceivedAt = Date.now();
  }
  /**
   * Optionally wraps, sync or async, and emits the event (if one comes back from the wrapper)
   */
  emitEvent(wrap, evt, relay, fromCache, optimisticPublish) {
    const wrapped = wrap ? wrapEvent3(evt) : evt;
    if (wrapped instanceof Promise) {
      wrapped.then((e) => this.emitEvent(false, e, relay, fromCache, optimisticPublish));
    } else if (wrapped) {
      this.emit("event", wrapped, relay, this, fromCache, optimisticPublish);
    }
  }
  closedReceived(relay, reason) {
    this.emit("closed", relay, reason);
  }
  // EOSE handling
  eoseTimeout;
  eosed = false;
  eoseReceived(relay) {
    this.eosesSeen.add(relay);
    let lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : void 0;
    const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;
    const queryFilled = queryFullyFilled(this);
    const performEose = (reason) => {
      if (this.eosed) return;
      if (this.eoseTimeout) clearTimeout(this.eoseTimeout);
      this.emit("eose", this);
      this.eosed = true;
      if (this.opts?.closeOnEose) this.stop();
    };
    if (queryFilled || hasSeenAllEoses) {
      performEose("query filled or seen all");
    } else if (this.relayFilters) {
      let timeToWaitForNextEose = 1e3;
      const connectedRelays = new Set(this.pool.connectedRelays().map((r) => r.url));
      const connectedRelaysWithFilters = Array.from(this.relayFilters.keys()).filter(
        (url) => connectedRelays.has(url)
      );
      if (connectedRelaysWithFilters.length === 0) {
        this.debug(
          "No connected relays, waiting for all relays to connect",
          Array.from(this.relayFilters.keys()).join(", ")
        );
        return;
      }
      const percentageOfRelaysThatHaveSentEose = this.eosesSeen.size / connectedRelaysWithFilters.length;
      if (this.eosesSeen.size >= 2 && percentageOfRelaysThatHaveSentEose >= 0.5) {
        timeToWaitForNextEose = timeToWaitForNextEose * (1 - percentageOfRelaysThatHaveSentEose);
        if (timeToWaitForNextEose === 0) {
          performEose("time to wait was 0");
          return;
        }
        if (this.eoseTimeout) clearTimeout(this.eoseTimeout);
        const sendEoseTimeout = () => {
          lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : void 0;
          if (lastEventSeen !== void 0 && lastEventSeen < 20) {
            this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
          } else {
            performEose(`send eose timeout: ${timeToWaitForNextEose}`);
          }
        };
        this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
      }
    }
  }
};
var kindIsEphemeral = (kind) => kind >= 2e4 && kind < 3e4;
async function follows(opts, outbox, kind = 3) {
  if (!this.ndk) throw new Error("NDK not set");
  const contactListEvent = await this.ndk.fetchEvent(
    { kinds: [kind], authors: [this.pubkey] },
    opts || { groupable: false }
  );
  if (contactListEvent) {
    const pubkeys = /* @__PURE__ */ new Set();
    contactListEvent.tags.forEach((tag) => {
      if (tag[0] === "p" && tag[1] && isValidPubkey(tag[1])) {
        pubkeys.add(tag[1]);
      }
    });
    if (outbox) {
      this.ndk?.outboxTracker?.trackUsers(Array.from(pubkeys));
    }
    return [...pubkeys].reduce((acc, pubkey) => {
      const user = new NDKUser({ pubkey });
      user.ndk = this.ndk;
      acc.add(user);
      return acc;
    }, /* @__PURE__ */ new Set());
  }
  return /* @__PURE__ */ new Set();
}
var NIP05_REGEX2 = /^(?:([\w.+-]+)@)?([\w.-]+)$/;
async function getNip05For(ndk, fullname, _fetch5 = fetch, fetchOpts = {}) {
  return await ndk.queuesNip05.add({
    id: fullname,
    func: async () => {
      if (ndk.cacheAdapter?.loadNip05) {
        const profile = await ndk.cacheAdapter.loadNip05(fullname);
        if (profile !== "missing") {
          if (profile) {
            const user = new NDKUser({
              pubkey: profile.pubkey,
              relayUrls: profile.relays,
              nip46Urls: profile.nip46
            });
            user.ndk = ndk;
            return user;
          }
          if (fetchOpts.cache !== "no-cache") {
            return null;
          }
        }
      }
      const match = fullname.match(NIP05_REGEX2);
      if (!match) return null;
      const [_, name = "_", domain] = match;
      try {
        const res = await _fetch5(`https://${domain}/.well-known/nostr.json?name=${name}`, fetchOpts);
        const { names, relays, nip46 } = parseNIP05Result(await res.json());
        const pubkey = names[name.toLowerCase()];
        let profile = null;
        if (pubkey) {
          profile = { pubkey, relays: relays?.[pubkey], nip46: nip46?.[pubkey] };
        }
        if (ndk?.cacheAdapter?.saveNip05) {
          ndk.cacheAdapter.saveNip05(fullname, profile);
        }
        return profile;
      } catch (_e) {
        if (ndk?.cacheAdapter?.saveNip05) {
          ndk?.cacheAdapter.saveNip05(fullname, null);
        }
        console.error("Failed to fetch NIP05 for", fullname, _e);
        return null;
      }
    }
  });
}
function parseNIP05Result(json) {
  const result = {
    names: {}
  };
  for (const [name, pubkey] of Object.entries(json.names)) {
    if (typeof name === "string" && typeof pubkey === "string") {
      result.names[name.toLowerCase()] = pubkey;
    }
  }
  if (json.relays) {
    result.relays = {};
    for (const [pubkey, relays] of Object.entries(json.relays)) {
      if (typeof pubkey === "string" && Array.isArray(relays)) {
        result.relays[pubkey] = relays.filter((relay) => typeof relay === "string");
      }
    }
  }
  if (json.nip46) {
    result.nip46 = {};
    for (const [pubkey, nip46] of Object.entries(json.nip46)) {
      if (typeof pubkey === "string" && Array.isArray(nip46)) {
        result.nip46[pubkey] = nip46.filter((relay) => typeof relay === "string");
      }
    }
  }
  return result;
}
function profileFromEvent(event) {
  const profile = {};
  let payload;
  try {
    payload = JSON.parse(event.content);
  } catch (error) {
    throw new Error(`Failed to parse profile event: ${error}`);
  }
  profile.profileEvent = JSON.stringify(event.rawEvent());
  for (const key of Object.keys(payload)) {
    switch (key) {
      case "name":
        profile.name = payload.name;
        break;
      case "display_name":
        profile.displayName = payload.display_name;
        break;
      case "image":
      case "picture":
        profile.picture = payload.picture || payload.image;
        profile.image = profile.picture;
        break;
      case "banner":
        profile.banner = payload.banner;
        break;
      case "bio":
        profile.bio = payload.bio;
        break;
      case "nip05":
        profile.nip05 = payload.nip05;
        break;
      case "lud06":
        profile.lud06 = payload.lud06;
        break;
      case "lud16":
        profile.lud16 = payload.lud16;
        break;
      case "about":
        profile.about = payload.about;
        break;
      case "website":
        profile.website = payload.website;
        break;
      default:
        profile[key] = payload[key];
        break;
    }
  }
  profile.created_at = event.created_at;
  return profile;
}
function serializeProfile(profile) {
  const payload = {};
  for (const [key, val] of Object.entries(profile)) {
    switch (key) {
      case "username":
      case "name":
        payload.name = val;
        break;
      case "displayName":
        payload.display_name = val;
        break;
      case "image":
      case "picture":
        payload.picture = val;
        break;
      case "bio":
      case "about":
        payload.about = val;
        break;
      default:
        payload[key] = val;
        break;
    }
  }
  return JSON.stringify(payload);
}
var NDKUser = class _NDKUser {
  ndk;
  profile;
  profileEvent;
  _npub;
  _pubkey;
  relayUrls = [];
  nip46Urls = [];
  constructor(opts) {
    if (opts.npub) this._npub = opts.npub;
    if (opts.hexpubkey) this._pubkey = opts.hexpubkey;
    if (opts.pubkey) this._pubkey = opts.pubkey;
    if (opts.relayUrls) this.relayUrls = opts.relayUrls;
    if (opts.nip46Urls) this.nip46Urls = opts.nip46Urls;
    if (opts.nprofile) {
      try {
        const decoded = nip19_exports.decode(opts.nprofile);
        if (decoded.type === "nprofile") {
          this._pubkey = decoded.data.pubkey;
          if (decoded.data.relays && decoded.data.relays.length > 0) {
            this.relayUrls.push(...decoded.data.relays);
          }
        }
      } catch (e) {
        console.error("Failed to decode nprofile", e);
      }
    }
  }
  get npub() {
    if (!this._npub) {
      if (!this._pubkey) throw new Error("pubkey not set");
      this._npub = nip19_exports.npubEncode(this.pubkey);
    }
    return this._npub;
  }
  get nprofile() {
    const relays = this.profileEvent?.onRelays?.map((r) => r.url);
    return nip19_exports.nprofileEncode({
      pubkey: this.pubkey,
      relays
    });
  }
  set npub(npub2) {
    this._npub = npub2;
  }
  /**
   * Get the user's pubkey
   * @returns {string} The user's pubkey
   */
  get pubkey() {
    if (!this._pubkey) {
      if (!this._npub) throw new Error("npub not set");
      this._pubkey = nip19_exports.decode(this.npub).data;
    }
    return this._pubkey;
  }
  /**
   * Set the user's pubkey
   * @param pubkey {string} The user's pubkey
   */
  set pubkey(pubkey) {
    this._pubkey = pubkey;
  }
  /**
   * Equivalent to NDKEvent.filters().
   * @returns {NDKFilter}
   */
  filter() {
    return { "#p": [this.pubkey] };
  }
  /**
   * Gets NIP-57 and NIP-61 information that this user has signaled
   *
   * @param getAll {boolean} Whether to get all zap info or just the first one
   */
  async getZapInfo(timeoutMs) {
    if (!this.ndk) throw new Error("No NDK instance found");
    const promiseWithTimeout = async (promise) => {
      if (!timeoutMs) return promise;
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
      });
      try {
        const result = await Promise.race([promise, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        return result;
      } catch (e) {
        if (e instanceof Error && e.message === "Timeout") {
          try {
            const result = await promise;
            return result;
          } catch (_originalError) {
            return void 0;
          }
        }
        return void 0;
      }
    };
    const [userProfile, mintListEvent] = await Promise.all([
      promiseWithTimeout(this.fetchProfile()),
      promiseWithTimeout(
        this.ndk.fetchEvent({ kinds: [
          10019
          /* CashuMintList */
        ], authors: [this.pubkey] })
      )
    ]);
    const res = /* @__PURE__ */ new Map();
    if (mintListEvent) {
      const mintList = NDKCashuMintList.from(mintListEvent);
      if (mintList.mints.length > 0) {
        res.set("nip61", {
          mints: mintList.mints,
          relays: mintList.relays,
          p2pk: mintList.p2pk
        });
      }
    }
    if (userProfile) {
      const { lud06, lud16 } = userProfile;
      res.set("nip57", { lud06, lud16 });
    }
    return res;
  }
  /**
   * Instantiate an NDKUser from a NIP-05 string
   * @param nip05Id {string} The user's NIP-05
   * @param ndk {NDK} An NDK instance
   * @param skipCache {boolean} Whether to skip the cache or not
   * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
   */
  static async fromNip05(nip05Id, ndk, skipCache = false) {
    if (!ndk) throw new Error("No NDK instance found");
    const opts = {};
    if (skipCache) opts.cache = "no-cache";
    const profile = await getNip05For(ndk, nip05Id, ndk?.httpFetch, opts);
    if (profile) {
      const user = new _NDKUser({
        pubkey: profile.pubkey,
        relayUrls: profile.relays,
        nip46Urls: profile.nip46
      });
      user.ndk = ndk;
      return user;
    }
  }
  /**
   * Fetch a user's profile
   * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
   * @param storeProfileEvent {boolean} Whether to store the profile event or not
   * @returns User Profile
   */
  async fetchProfile(opts, storeProfileEvent = false) {
    if (!this.ndk) throw new Error("NDK not set");
    let setMetadataEvent = null;
    if (this.ndk.cacheAdapter && (this.ndk.cacheAdapter.fetchProfile || this.ndk.cacheAdapter.fetchProfileSync) && opts?.cacheUsage !== "ONLY_RELAY") {
      let profile = null;
      if (this.ndk.cacheAdapter.fetchProfileSync) {
        profile = this.ndk.cacheAdapter.fetchProfileSync(this.pubkey);
      } else if (this.ndk.cacheAdapter.fetchProfile) {
        profile = await this.ndk.cacheAdapter.fetchProfile(this.pubkey);
      }
      if (profile) {
        this.profile = profile;
        return profile;
      }
    }
    opts ??= {};
    opts.cacheUsage ??= "ONLY_RELAY";
    opts.closeOnEose ??= true;
    opts.groupable ??= true;
    opts.groupableDelay ??= 25;
    if (!setMetadataEvent) {
      setMetadataEvent = await this.ndk.fetchEvent(
        { kinds: [0], authors: [this.pubkey] },
        opts
      );
    }
    if (!setMetadataEvent) return null;
    this.profile = profileFromEvent(setMetadataEvent);
    if (storeProfileEvent && this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
      this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile);
    }
    return this.profile;
  }
  /**
   * Returns a set of users that this user follows.
   *
   * @deprecated Use followSet instead
   */
  follows = follows.bind(this);
  /**
   * Returns a set of pubkeys that this user follows.
   *
   * @param opts - NDKSubscriptionOptions
   * @param outbox - boolean
   * @param kind - number
   */
  async followSet(opts, outbox, kind = 3) {
    const follows2 = await this.follows(opts, outbox, kind);
    return new Set(Array.from(follows2).map((f) => f.pubkey));
  }
  /** @deprecated Use referenceTags instead. */
  /**
   * Get the tag that can be used to reference this user in an event
   * @returns {NDKTag} an NDKTag
   */
  tagReference() {
    return ["p", this.pubkey];
  }
  /**
   * Get the tags that can be used to reference this user in an event
   * @returns {NDKTag[]} an array of NDKTag
   */
  referenceTags(marker) {
    const tag = [["p", this.pubkey]];
    if (!marker) return tag;
    tag[0].push("", marker);
    return tag;
  }
  /**
   * Publishes the current profile.
   */
  async publish() {
    if (!this.ndk) throw new Error("No NDK instance found");
    if (!this.profile) throw new Error("No profile available");
    this.ndk.assertSigner();
    const event = new NDKEvent(this.ndk, {
      kind: 0,
      content: serializeProfile(this.profile)
    });
    await event.publish();
  }
  /**
   * Add one or more follows to this user's contact list
   *
   * @param newFollow {NDKUser | Hexpubkey | Array} The user(s) to follow
   * @param currentFollowList {Set<NDKUser | Hexpubkey>} The current follow list
   * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
   * @returns {Promise<boolean>} True if any follows were added, false if all already exist
   */
  async follow(newFollow, currentFollowList, kind = 3) {
    if (!this.ndk) throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    if (!currentFollowList) {
      currentFollowList = await this.follows(void 0, void 0, kind);
    }
    const followsToAdd = Array.isArray(newFollow) ? newFollow : [newFollow];
    let anyAdded = false;
    for (const follow of followsToAdd) {
      const followPubkey = typeof follow === "string" ? follow : follow.pubkey;
      const isAlreadyFollowing = Array.from(currentFollowList).some(
        (item) => typeof item === "string" ? item === followPubkey : item.pubkey === followPubkey
      );
      if (!isAlreadyFollowing) {
        currentFollowList.add(follow);
        anyAdded = true;
      }
    }
    if (!anyAdded) {
      return false;
    }
    const event = new NDKEvent(this.ndk, { kind });
    for (const follow of currentFollowList) {
      if (typeof follow === "string") {
        event.tags.push(["p", follow]);
      } else {
        event.tag(follow);
      }
    }
    await event.publish();
    return true;
  }
  /**
   * Remove one or more follows from this user's contact list
   *
   * @param user {NDKUser | Hexpubkey | Array} The user(s) to unfollow
   * @param currentFollowList {Set<NDKUser | Hexpubkey>} The current follow list
   * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
   * @returns The relays where the follow list was published or false if none were found
   */
  async unfollow(user, currentFollowList, kind = 3) {
    if (!this.ndk) throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    if (!currentFollowList) {
      currentFollowList = await this.follows(void 0, void 0, kind);
    }
    const usersToUnfollow = Array.isArray(user) ? user : [user];
    const unfollowPubkeys = new Set(
      usersToUnfollow.map((u) => typeof u === "string" ? u : u.pubkey)
    );
    const newUserFollowList = /* @__PURE__ */ new Set();
    let foundAny = false;
    for (const follow of currentFollowList) {
      const followPubkey = typeof follow === "string" ? follow : follow.pubkey;
      if (!unfollowPubkeys.has(followPubkey)) {
        newUserFollowList.add(follow);
      } else {
        foundAny = true;
      }
    }
    if (!foundAny) return false;
    const event = new NDKEvent(this.ndk, { kind });
    for (const follow of newUserFollowList) {
      if (typeof follow === "string") {
        event.tags.push(["p", follow]);
      } else {
        event.tag(follow);
      }
    }
    return await event.publish();
  }
  /**
   * Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)
   *
   * @param nip05Id The NIP-05 string to validate
   * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's pubkey,
   * False if the NIP-05 is found but doesn't match this user's pubkey,
   * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
   */
  async validateNip05(nip05Id) {
    if (!this.ndk) throw new Error("No NDK instance found");
    const profilePointer = await getNip05For(this.ndk, nip05Id);
    if (profilePointer === null) return null;
    return profilePointer.pubkey === this.pubkey;
  }
};
var signerRegistry = /* @__PURE__ */ new Map();
function registerSigner(type, signerClass) {
  signerRegistry.set(type, signerClass);
}
var NDKPrivateKeySigner = class _NDKPrivateKeySigner {
  _user;
  _privateKey;
  _pubkey;
  /**
   * Create a new signer from a private key.
   * @param privateKey - The private key to use in hex form or nsec.
   * @param ndk - The NDK instance to use.
   *
   * @ai-guardrail
   * If you have an nsec (bech32-encoded private key starting with "nsec1"), you can pass it directly
   * to this constructor without decoding it first. The constructor handles both hex and nsec formats automatically.
   * DO NOT use nip19.decode() to convert nsec to hex before passing it here - just pass the nsec string directly.
   */
  constructor(privateKeyOrNsec, ndk) {
    if (typeof privateKeyOrNsec === "string") {
      if (privateKeyOrNsec.startsWith("nsec1")) {
        const { type, data } = nip19_exports.decode(privateKeyOrNsec);
        if (type === "nsec") this._privateKey = data;
        else throw new Error("Invalid private key provided.");
      } else if (privateKeyOrNsec.length === 64) {
        this._privateKey = hexToBytes2(privateKeyOrNsec);
      } else {
        throw new Error("Invalid private key provided.");
      }
    } else {
      this._privateKey = privateKeyOrNsec;
    }
    this._pubkey = getPublicKey(this._privateKey);
    if (ndk) this._user = ndk.getUser({ pubkey: this._pubkey });
    this._user ??= new NDKUser({ pubkey: this._pubkey });
  }
  /**
   * Get the private key in hex form.
   */
  get privateKey() {
    if (!this._privateKey) throw new Error("Not ready");
    return bytesToHex3(this._privateKey);
  }
  /**
   * Get the public key in hex form.
   */
  get pubkey() {
    if (!this._pubkey) throw new Error("Not ready");
    return this._pubkey;
  }
  /**
   * Get the private key in nsec form.
   */
  get nsec() {
    if (!this._privateKey) throw new Error("Not ready");
    return nip19_exports.nsecEncode(this._privateKey);
  }
  /**
   * Get the public key in npub form.
   */
  get npub() {
    if (!this._pubkey) throw new Error("Not ready");
    return nip19_exports.npubEncode(this._pubkey);
  }
  /**
   * Encrypt the private key with a password to ncryptsec format.
   * @param password - The password to encrypt the private key.
   * @param logn - The log2 of the scrypt N parameter (default: 16).
   * @param ksb - The key security byte (0x00, 0x01, or 0x02, default: 0x02).
   * @returns The encrypted private key in ncryptsec format.
   *
   * @example
   * ```ts
   * const signer = new NDKPrivateKeySigner(nsec);
   * const ncryptsec = signer.encryptToNcryptsec("my-password");
   * console.log('encrypted key:', ncryptsec);
   * ```
   */
  encryptToNcryptsec(password, logn = 16, ksb = 2) {
    if (!this._privateKey) throw new Error("Private key not available");
    return encrypt3(this._privateKey, password, logn, ksb);
  }
  /**
   * Generate a new private key.
   */
  static generate() {
    const privateKey = generateSecretKey();
    return new _NDKPrivateKeySigner(privateKey);
  }
  /**
   * Create a signer from an encrypted private key (ncryptsec) using a password.
   * @param ncryptsec - The encrypted private key in ncryptsec format.
   * @param password - The password to decrypt the private key.
   * @param ndk - Optional NDK instance.
   * @returns A new NDKPrivateKeySigner instance.
   *
   * @example
   * ```ts
   * const signer = NDKPrivateKeySigner.fromNcryptsec(
   *   "ncryptsec1qgg9947rlpvqu76pj5ecreduf9jxhselq2nae2kghhvd5g7dgjtcxfqtd67p9m0w57lspw8gsq6yphnm8623nsl8xn9j4jdzz84zm3frztj3z7s35vpzmqf6ksu8r89qk5z2zxfmu5gv8th8wclt0h4p",
   *   "my-password"
   * );
   * console.log('your pubkey is', signer.pubkey);
   * ```
   */
  static fromNcryptsec(ncryptsec, password, ndk) {
    const privateKeyBytes = decrypt3(ncryptsec, password);
    return new _NDKPrivateKeySigner(privateKeyBytes, ndk);
  }
  /**
   * Noop in NDKPrivateKeySigner.
   */
  async blockUntilReady() {
    return this._user;
  }
  /**
   * Get the user.
   */
  async user() {
    return this._user;
  }
  /**
   * Get the user.
   */
  get userSync() {
    return this._user;
  }
  async sign(event) {
    if (!this._privateKey) {
      throw Error("Attempted to sign without a private key");
    }
    return finalizeEvent(event, this._privateKey).sig;
  }
  async encryptionEnabled(scheme) {
    const enabled = [];
    if (!scheme || scheme === "nip04") enabled.push("nip04");
    if (!scheme || scheme === "nip44") enabled.push("nip44");
    return enabled;
  }
  async encrypt(recipient, value, scheme) {
    if (!this._privateKey || !this.privateKey) {
      throw Error("Attempted to encrypt without a private key");
    }
    const recipientHexPubKey = recipient.pubkey;
    if (scheme === "nip44") {
      const conversationKey = nip44_exports.v2.utils.getConversationKey(this._privateKey, recipientHexPubKey);
      return await nip44_exports.v2.encrypt(value, conversationKey);
    }
    return await nip04_exports.encrypt(this._privateKey, recipientHexPubKey, value);
  }
  async decrypt(sender, value, scheme) {
    if (!this._privateKey || !this.privateKey) {
      throw Error("Attempted to decrypt without a private key");
    }
    const senderHexPubKey = sender.pubkey;
    if (scheme === "nip44") {
      const conversationKey = nip44_exports.v2.utils.getConversationKey(this._privateKey, senderHexPubKey);
      return await nip44_exports.v2.decrypt(value, conversationKey);
    }
    return await nip04_exports.decrypt(this._privateKey, senderHexPubKey, value);
  }
  /**
   * Serializes the signer's private key into a storable format.
   * @returns A JSON string containing the type and the hex private key.
   */
  toPayload() {
    if (!this._privateKey) throw new Error("Private key not available");
    const payload = {
      type: "private-key",
      payload: this.privateKey
      // Use the hex private key
    };
    return JSON.stringify(payload);
  }
  /**
   * Deserializes the signer from a payload string.
   * @param payloadString The JSON string obtained from toPayload().
   * @param ndk Optional NDK instance.
   * @returns An instance of NDKPrivateKeySigner.
   */
  static async fromPayload(payloadString, ndk) {
    const payload = JSON.parse(payloadString);
    if (payload.type !== "private-key") {
      throw new Error(`Invalid payload type: expected 'private-key', got ${payload.type}`);
    }
    if (!payload.payload || typeof payload.payload !== "string") {
      throw new Error("Invalid payload content for private-key signer");
    }
    return new _NDKPrivateKeySigner(payload.payload, ndk);
  }
};
registerSigner("private-key", NDKPrivateKeySigner);
async function giftWrap(event, recipient, signer, params = {}) {
  let _signer = signer;
  params.scheme ??= "nip44";
  if (!_signer) {
    if (!event.ndk) throw new Error("no signer available for giftWrap");
    _signer = event.ndk.signer;
  }
  if (!_signer) throw new Error("no signer");
  if (!_signer.encryptionEnabled || !_signer.encryptionEnabled(params.scheme))
    throw new Error("signer is not able to giftWrap");
  if (!event.pubkey) {
    const sender = await _signer.user();
    event.pubkey = sender.pubkey;
  }
  if (event.sig) {
    console.warn(
      "\u26A0\uFE0F NIP-17 Warning: Rumor event should not be signed. The signature will be removed during gift wrapping."
    );
  }
  const rumor = getRumorEvent(event, params?.rumorKind);
  const seal = await getSealEvent(rumor, recipient, _signer, params.scheme);
  const wrap = await getWrapEvent(seal, recipient, params);
  return new NDKEvent(event.ndk, wrap);
}
async function giftUnwrap(event, sender, signer, scheme = "nip44") {
  if (event.ndk?.cacheAdapter?.getDecryptedEvent) {
    const cached = await event.ndk.cacheAdapter.getDecryptedEvent(event.id);
    if (cached) {
      return cached;
    }
  }
  const _sender = sender || new NDKUser({ pubkey: event.pubkey });
  const _signer = signer || event.ndk?.signer;
  if (!_signer) throw new Error("no signer");
  try {
    const seal = JSON.parse(await _signer.decrypt(_sender, event.content, scheme));
    if (!seal) throw new Error("Failed to decrypt wrapper");
    if (!new NDKEvent(void 0, seal).verifySignature(false))
      throw new Error("GiftSeal signature verification failed!");
    const rumorSender = new NDKUser({ pubkey: seal.pubkey });
    const rumor = JSON.parse(await _signer.decrypt(rumorSender, seal.content, scheme));
    if (!rumor) throw new Error("Failed to decrypt seal");
    if (rumor.pubkey !== seal.pubkey) throw new Error("Invalid GiftWrap, sender validation failed!");
    const rumorEvent = new NDKEvent(event.ndk, rumor);
    if (event.ndk?.cacheAdapter?.addDecryptedEvent) {
      await event.ndk.cacheAdapter.addDecryptedEvent(event.id, rumorEvent);
    }
    return rumorEvent;
  } catch (_e) {
    return Promise.reject("Got error unwrapping event! See console log.");
  }
}
function getRumorEvent(event, kind) {
  const rumor = event.rawEvent();
  rumor.kind = kind || rumor.kind || 14;
  rumor.sig = void 0;
  rumor.id = getEventHash(rumor);
  return new NDKEvent(event.ndk, rumor);
}
async function getSealEvent(rumor, recipient, signer, scheme = "nip44") {
  const seal = new NDKEvent(rumor.ndk);
  seal.kind = 13;
  seal.created_at = approximateNow(5);
  seal.content = JSON.stringify(rumor.rawEvent());
  await seal.encrypt(recipient, signer, scheme);
  await seal.sign(signer);
  return seal;
}
async function getWrapEvent(sealed, recipient, params, scheme = "nip44") {
  const signer = NDKPrivateKeySigner.generate();
  const wrap = new NDKEvent(sealed.ndk);
  wrap.kind = 1059;
  wrap.created_at = approximateNow(5);
  if (params?.wrapTags) wrap.tags = params.wrapTags;
  wrap.tag(recipient);
  wrap.content = JSON.stringify(sealed.rawEvent());
  await wrap.encrypt(recipient, signer, scheme);
  await wrap.sign(signer);
  return wrap;
}
function approximateNow(drift = 0) {
  return Math.round(Date.now() / 1e3 - Math.random() * 10 ** drift);
}
function proofsTotalBalance(proofs) {
  return proofs.reduce((acc, proof) => {
    if (proof.amount < 0) {
      throw new Error("proof amount is negative");
    }
    return acc + proof.amount;
  }, 0);
}
var NDKCashuToken = class _NDKCashuToken extends NDKEvent {
  _proofs = [];
  _mint;
  static kind = 7375;
  static kinds = [
    7375
    /* CashuToken */
  ];
  /**
   * Tokens that this token superseeds
   */
  _deletes = [];
  original;
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 7375;
  }
  static async from(event) {
    const token = new _NDKCashuToken(event.ndk, event);
    token.original = event;
    try {
      await token.decrypt();
    } catch {
      token.content = token.original.content;
    }
    try {
      const content = JSON.parse(token.content);
      token.proofs = content.proofs;
      token.mint = content.mint ?? token.tagValue("mint");
      token.deletedTokens = content.del ?? [];
      if (!Array.isArray(token.proofs)) return;
    } catch (_e) {
      return;
    }
    return token;
  }
  get proofs() {
    return this._proofs;
  }
  set proofs(proofs) {
    const cs = /* @__PURE__ */ new Set();
    this._proofs = proofs.filter((proof) => {
      if (cs.has(proof.C)) {
        console.warn("Passed in proofs had duplicates, ignoring", proof.C);
        return false;
      }
      if (proof.amount < 0) {
        console.warn("Invalid proof with negative amount", proof);
        return false;
      }
      cs.add(proof.C);
      return true;
    }).map(this.cleanProof);
  }
  /**
   * Returns a minimal proof object with only essential properties
   */
  cleanProof(proof) {
    return {
      id: proof.id,
      amount: proof.amount,
      C: proof.C,
      secret: proof.secret
    };
  }
  async toNostrEvent(pubkey) {
    if (!this.ndk) throw new Error("no ndk");
    if (!this.ndk.signer) throw new Error("no signer");
    const payload = {
      proofs: this.proofs.map(this.cleanProof),
      mint: this.mint,
      del: this.deletedTokens ?? []
    };
    this.content = JSON.stringify(payload);
    const user = await this.ndk.signer.user();
    await this.encrypt(user, void 0, "nip44");
    return super.toNostrEvent(pubkey);
  }
  set mint(mint) {
    this._mint = mint;
  }
  get mint() {
    return this._mint;
  }
  /**
   * Tokens that were deleted by the creation of this token.
   */
  get deletedTokens() {
    return this._deletes;
  }
  /**
   * Marks tokens that were deleted by the creation of this token.
   */
  set deletedTokens(tokenIds) {
    this._deletes = tokenIds;
  }
  get amount() {
    return proofsTotalBalance(this.proofs);
  }
  async publish(relaySet, timeoutMs, requiredRelayCount) {
    if (this.original) {
      return this.original.publish(relaySet, timeoutMs, requiredRelayCount);
    }
    return super.publish(relaySet, timeoutMs, requiredRelayCount);
  }
};
var MARKERS = {
  REDEEMED: "redeemed",
  CREATED: "created",
  DESTROYED: "destroyed",
  RESERVED: "reserved"
};
var NDKCashuWalletTx = class _NDKCashuWalletTx extends NDKEvent {
  static MARKERS = MARKERS;
  static kind = 7376;
  static kinds = [
    7376
    /* CashuWalletTx */
  ];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 7376;
  }
  static async from(event) {
    const walletChange = new _NDKCashuWalletTx(event.ndk, event);
    const prevContent = walletChange.content;
    try {
      await walletChange.decrypt();
    } catch (_e) {
      walletChange.content ??= prevContent;
    }
    try {
      const contentTags = JSON.parse(walletChange.content);
      walletChange.tags = [...contentTags, ...walletChange.tags];
    } catch (_e) {
      return;
    }
    return walletChange;
  }
  set direction(direction) {
    this.removeTag("direction");
    if (direction) this.tags.push(["direction", direction]);
  }
  get direction() {
    return this.tagValue("direction");
  }
  set amount(amount) {
    this.removeTag("amount");
    this.tags.push(["amount", amount.toString()]);
  }
  get amount() {
    const val = this.tagValue("amount");
    if (val === void 0) return void 0;
    return Number(val);
  }
  set fee(fee) {
    this.removeTag("fee");
    this.tags.push(["fee", fee.toString()]);
  }
  get fee() {
    const val = this.tagValue("fee");
    if (val === void 0) return void 0;
    return Number(val);
  }
  set unit(unit) {
    this.removeTag("unit");
    if (unit) this.tags.push(["unit", unit.toString()]);
  }
  get unit() {
    return this.tagValue("unit");
  }
  set description(description) {
    this.removeTag("description");
    if (description) this.tags.push(["description", description.toString()]);
  }
  get description() {
    return this.tagValue("description");
  }
  set mint(mint) {
    this.removeTag("mint");
    if (mint) this.tags.push(["mint", mint.toString()]);
  }
  get mint() {
    return this.tagValue("mint");
  }
  /**
   * Tags tokens that were created in this history event
   */
  set destroyedTokens(events) {
    for (const event of events) {
      this.tags.push(event.tagReference(MARKERS.DESTROYED));
    }
  }
  set destroyedTokenIds(ids) {
    for (const id of ids) {
      this.tags.push(["e", id, "", MARKERS.DESTROYED]);
    }
  }
  /**
   * Tags tokens that were created in this history event
   */
  set createdTokens(events) {
    for (const event of events) {
      this.tags.push(event.tagReference(MARKERS.CREATED));
    }
  }
  set reservedTokens(events) {
    for (const event of events) {
      this.tags.push(event.tagReference(MARKERS.RESERVED));
    }
  }
  addRedeemedNutzap(event) {
    this.tag(event, MARKERS.REDEEMED);
  }
  async toNostrEvent(pubkey) {
    const encryptedTags = [];
    const unencryptedTags = [];
    for (const tag of this.tags) {
      if (!this.shouldEncryptTag(tag)) {
        unencryptedTags.push(tag);
      } else {
        encryptedTags.push(tag);
      }
    }
    this.tags = unencryptedTags.filter((t) => t[0] !== "client");
    this.content = JSON.stringify(encryptedTags);
    const user = await this.ndk?.signer?.user();
    if (user) {
      const ownPubkey = user.pubkey;
      this.tags = this.tags.filter((t) => t[0] !== "p" || t[1] !== ownPubkey);
    }
    await this.encrypt(user, void 0, "nip44");
    return super.toNostrEvent(pubkey);
  }
  /**
   * Whether this entry includes a redemption of a Nutzap
   */
  get hasNutzapRedemption() {
    return this.getMatchingTags("e", MARKERS.REDEEMED).length > 0;
  }
  shouldEncryptTag(tag) {
    const unencryptedTagNames = ["client"];
    if (unencryptedTagNames.includes(tag[0])) {
      return false;
    }
    if (tag[0] === "e" && tag[3] === MARKERS.REDEEMED) {
      return false;
    }
    if (tag[0] === "p") return false;
    return true;
  }
};
var NDKInterestList = class _NDKInterestList extends NDKEvent {
  static kind = 10015;
  static kinds = [
    10015
    /* InterestList */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10015;
  }
  static from(ndkEvent) {
    return new _NDKInterestList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  /**
   * Get all interest hashtags from the list.
   */
  get interests() {
    return this.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]).filter(Boolean);
  }
  /**
   * Set interest hashtags, replacing all existing ones.
   */
  set interests(hashtags) {
    this.tags = this.tags.filter((tag) => tag[0] !== "t");
    for (const hashtag of hashtags) {
      this.tags.push(["t", hashtag]);
    }
  }
  /**
   * Add a single interest hashtag to the list.
   * @param hashtag The hashtag to add (without the # symbol)
   */
  addInterest(hashtag) {
    if (!this.hasInterest(hashtag)) {
      this.tags.push(["t", hashtag]);
    }
  }
  /**
   * Remove an interest hashtag from the list.
   * @param hashtag The hashtag to remove
   */
  removeInterest(hashtag) {
    const index = this.tags.findIndex((tag) => tag[0] === "t" && tag[1] === hashtag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
  /**
   * Check if the list contains a specific interest hashtag.
   * @param hashtag The hashtag to check for
   */
  hasInterest(hashtag) {
    return this.tags.some((tag) => tag[0] === "t" && tag[1] === hashtag);
  }
  /**
   * Get interest set references (kind:30015) from "a" tags.
   */
  get interestSetReferences() {
    return this.tags.filter((tag) => tag[0] === "a").map((tag) => tag[1]).filter((ref) => ref?.startsWith("30015:"));
  }
};
function zapInvoiceFromEvent(event) {
  const description = event.getMatchingTags("description")[0];
  const bolt11 = event.getMatchingTags("bolt11")[0];
  let decodedInvoice;
  let zapRequest;
  if (!description || !bolt11 || !bolt11[1]) {
    return null;
  }
  try {
    let zapRequestPayload = description[1];
    if (zapRequestPayload.startsWith("%")) {
      zapRequestPayload = decodeURIComponent(zapRequestPayload);
    }
    if (zapRequestPayload === "") {
      return null;
    }
    zapRequest = JSON.parse(zapRequestPayload);
    decodedInvoice = (0, import_light_bolt11_decoder.decode)(bolt11[1]);
  } catch (_e) {
    return null;
  }
  const amountSection = decodedInvoice.sections.find((s) => s.name === "amount");
  if (!amountSection) {
    return null;
  }
  const amount = Number.parseInt(amountSection.value);
  if (!amount) {
    return null;
  }
  const content = zapRequest.content;
  const sender = zapRequest.pubkey;
  const recipientTag = event.getMatchingTags("p")[0];
  const recipient = recipientTag[1];
  let zappedEvent = event.getMatchingTags("e")[0];
  if (!zappedEvent) {
    zappedEvent = event.getMatchingTags("a")[0];
  }
  const zappedEventId = zappedEvent ? zappedEvent[1] : void 0;
  const zapInvoice = {
    id: event.id,
    zapper: event.pubkey,
    zappee: sender,
    zapped: recipient,
    zappedEvent: zappedEventId,
    amount,
    comment: content
  };
  return zapInvoice;
}
var NDKZap = class _NDKZap extends NDKEvent {
  static kind = 9735;
  static kinds = [
    9735
    /* Zap */
  ];
  _invoice;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 9735;
  }
  /**
   * Creates an NDKZap instance from an NDKEvent
   *
   * @param event The event to convert
   * @returns NDKZap instance or null if invalid
   */
  static from(event) {
    if (event.kind !== 9735) return null;
    return new _NDKZap(event.ndk, event.rawEvent());
  }
  /**
   * Get the parsed zap invoice (lazy loaded, cached)
   * Returns null if the zap event is invalid or malformed
   */
  get invoice() {
    if (this._invoice !== void 0) return this._invoice;
    this._invoice = zapInvoiceFromEvent(this);
    return this._invoice;
  }
  /**
   * Amount in sats (converted from millisats in the invoice)
   * Returns 0 if invoice is invalid
   */
  get amount() {
    return this.invoice ? Math.floor(this.invoice.amount / 1e3) : 0;
  }
  /**
   * The user who sent the zap (zappee)
   *
   * @throws Error if zap is invalid or NDK instance is not available
   */
  get sender() {
    const pubkey = this.invoice?.zappee;
    if (!pubkey) throw new Error("Invalid zap - no sender");
    if (!this.ndk) throw new Error("No NDK instance");
    return this.ndk.getUser({ pubkey });
  }
  /**
   * The user who received the zap (zapped)
   *
   * @throws Error if zap is invalid or NDK instance is not available
   */
  get recipient() {
    const pubkey = this.invoice?.zapped;
    if (!pubkey) throw new Error("Invalid zap - no recipient");
    if (!this.ndk) throw new Error("No NDK instance");
    return this.ndk.getUser({ pubkey });
  }
  /**
   * Zap comment/message from the zap request
   */
  get comment() {
    return this.invoice?.comment;
  }
  /**
   * The event that was zapped (if any)
   * Can be an event ID (e tag) or address (a tag)
   */
  get zappedEventId() {
    return this.invoice?.zappedEvent;
  }
  /**
   * The zapper service pubkey that processed this zap
   */
  get zapper() {
    return this.invoice?.zapper;
  }
  /**
   * Check if this is a valid zap
   */
  get isValid() {
    return this.invoice !== null;
  }
};
var NDKSimpleGroup = class _NDKSimpleGroup {
  ndk;
  groupId;
  relaySet;
  fetchingMetadata;
  metadata;
  memberList;
  adminList;
  constructor(ndk, relaySet, groupId) {
    this.ndk = ndk;
    this.groupId = groupId ?? randomId(24);
    this.relaySet = relaySet;
  }
  get id() {
    return this.groupId;
  }
  relayUrls() {
    return this.relaySet?.relayUrls;
  }
  get name() {
    return this.metadata?.name;
  }
  get about() {
    return this.metadata?.about;
  }
  get picture() {
    return this.metadata?.picture;
  }
  get members() {
    return this.memberList?.members ?? [];
  }
  get admins() {
    return this.adminList?.members ?? [];
  }
  async getMetadata() {
    await this.ensureMetadataEvent();
    return this.metadata;
  }
  /**
   * Creates the group by publishing a kind:9007 event.
   * @param signer
   * @returns
   */
  async createGroup(signer) {
    signer ??= this.ndk.signer;
    if (!signer) throw new Error("No signer available");
    const user = await signer.user();
    if (!user) throw new Error("No user available");
    const event = new NDKEvent(this.ndk);
    event.kind = 9007;
    event.tags.push(["h", this.groupId]);
    await event.sign(signer);
    return event.publish(this.relaySet);
  }
  async setMetadata({ name, about, picture }) {
    const event = new NDKEvent(this.ndk);
    event.kind = 9002;
    event.tags.push(["h", this.groupId]);
    if (name) event.tags.push(["name", name]);
    if (about) event.tags.push(["about", about]);
    if (picture) event.tags.push(["picture", picture]);
    await event.sign();
    return event.publish(this.relaySet);
  }
  /**
   * Adds a user to the group using a kind:9000 event
   * @param user user to add
   * @param opts options
   */
  async addUser(user) {
    const addUserEvent = _NDKSimpleGroup.generateAddUserEvent(user.pubkey, this.groupId);
    addUserEvent.ndk = this.ndk;
    return addUserEvent;
  }
  async getMemberListEvent() {
    const memberList = await this.ndk.fetchEvent(
      {
        kinds: [
          39002
          /* GroupMembers */
        ],
        "#d": [this.groupId]
      },
      void 0,
      this.relaySet
    );
    if (!memberList) return null;
    return NDKSimpleGroupMemberList.from(memberList);
  }
  /**
   * Gets a list of users that belong to this group
   */
  async getMembers() {
    const members = [];
    const memberPubkeys = /* @__PURE__ */ new Set();
    const memberListEvent = await this.getMemberListEvent();
    if (!memberListEvent) return [];
    for (const pTag of memberListEvent.getMatchingTags("p")) {
      const pubkey = pTag[1];
      if (!pubkey || !isValidPubkey(pubkey)) continue;
      if (memberPubkeys.has(pubkey)) continue;
      memberPubkeys.add(pubkey);
      try {
        members.push(this.ndk.getUser({ pubkey }));
      } catch {
      }
    }
    return members;
  }
  /**
   * Generates an event that lists the members of a group.
   * @param groupId
   * @returns
   */
  static generateUserListEvent(groupId) {
    const event = new NDKEvent(void 0, {
      kind: 39002,
      tags: [
        ["h", groupId],
        ["alt", "Group Member List"]
      ]
    });
    return event;
  }
  /**
   * Generates an event that adds a user to a group.
   * @param userPubkey pubkey of the user to add
   * @param groupId group to add the user to
   * @returns
   */
  static generateAddUserEvent(userPubkey, groupId) {
    const event = new NDKEvent(void 0, {
      kind: 9e3,
      tags: [["h", groupId]]
    });
    event.tags.push(["p", userPubkey]);
    return event;
  }
  async requestToJoin(_pubkey, content) {
    const event = new NDKEvent(this.ndk, {
      kind: 9021,
      content: content ?? "",
      tags: [["h", this.groupId]]
    });
    return event.publish(this.relaySet);
  }
  /**
   * Makes sure that a metadata event exists locally
   */
  async ensureMetadataEvent() {
    if (this.metadata) return;
    if (this.fetchingMetadata) return this.fetchingMetadata;
    this.fetchingMetadata = this.ndk.fetchEvent(
      {
        kinds: [
          39e3
          /* GroupMetadata */
        ],
        "#d": [this.groupId]
      },
      void 0,
      this.relaySet
    ).then((event) => {
      if (event) {
        this.metadata = NDKSimpleGroupMetadata.from(event);
      } else {
        this.metadata = new NDKSimpleGroupMetadata(this.ndk);
        this.metadata.dTag = this.groupId;
      }
    }).finally(() => {
      this.fetchingMetadata = void 0;
    }).catch(() => {
      throw new Error(`Failed to fetch metadata for group ${this.groupId}`);
    });
    return this.fetchingMetadata;
  }
};
function randomId(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length;
  let result = "";
  for (let i2 = 0; i2 < length; i2++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}
var NDKVoiceMessage = class _NDKVoiceMessage extends NDKEvent {
  static kind = 1222;
  static kinds = [
    1222
    /* VoiceMessage */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 1222;
  }
  /**
   * Creates a NDKVoiceMessage from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKVoiceMessage from.
   * @returns NDKVoiceMessage
   */
  static from(event) {
    return new _NDKVoiceMessage(event.ndk, event);
  }
  /**
   * Getter for the audio URL.
   *
   * @returns {string | undefined} - The audio file URL if available, otherwise undefined.
   */
  get url() {
    return this.content || void 0;
  }
  /**
   * Setter for the audio URL.
   *
   * @param {string | undefined} url - The audio URL to set for the voice message.
   */
  set url(url) {
    this.content = url || "";
  }
  /**
   * Getter for the waveform data from imeta tag.
   *
   * @returns {number[] | undefined} - Array of amplitude values if available, otherwise undefined.
   */
  get waveform() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (!imetaTag) return void 0;
    const waveformValue = imetaTag.find((value) => value.startsWith("waveform "));
    if (!waveformValue) return void 0;
    const waveformStr = waveformValue.replace("waveform ", "");
    return waveformStr.split(" ").map((v) => parseInt(v, 10));
  }
  /**
   * Setter for the waveform data in imeta tag.
   *
   * @param {number[] | undefined} waveform - Array of amplitude values (0-100).
   */
  set waveform(waveform) {
    this.removeTag("imeta");
    if (waveform && waveform.length > 0) {
      const imetaTag = ["imeta", `url ${this.content}`];
      imetaTag.push(`waveform ${waveform.join(" ")}`);
      const duration = this.duration;
      if (duration !== void 0) {
        imetaTag.push(`duration ${duration}`);
      }
      this.tags.push(imetaTag);
    }
  }
  /**
   * Getter for the audio duration in seconds from imeta tag.
   *
   * @returns {number | undefined} - The audio duration in seconds if available, otherwise undefined.
   */
  get duration() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (!imetaTag) return void 0;
    const durationValue = imetaTag.find((value) => value.startsWith("duration "));
    if (!durationValue) return void 0;
    const durationStr = durationValue.replace("duration ", "");
    return parseInt(durationStr, 10);
  }
  /**
   * Setter for the audio duration in imeta tag.
   *
   * @param {number | undefined} duration - The audio duration in seconds.
   */
  set duration(duration) {
    const existingImeta = this.tags.find((tag) => tag[0] === "imeta");
    if (duration !== void 0) {
      if (existingImeta) {
        const durationIndex = existingImeta.findIndex((v) => v.startsWith("duration "));
        if (durationIndex > 0) {
          existingImeta[durationIndex] = `duration ${duration}`;
        } else {
          existingImeta.push(`duration ${duration}`);
        }
      } else {
        const imetaTag = ["imeta", `url ${this.content}`, `duration ${duration}`];
        this.tags.push(imetaTag);
      }
    } else if (existingImeta) {
      const filtered = existingImeta.filter((v) => !v.startsWith("duration "));
      if (filtered.length <= 1) {
        this.removeTag("imeta");
      } else {
        const index = this.tags.indexOf(existingImeta);
        this.tags[index] = filtered;
      }
    }
  }
};
var NDKVoiceReply = class _NDKVoiceReply extends NDKEvent {
  static kind = 1244;
  static kinds = [
    1244
    /* VoiceReply */
  ];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 1244;
  }
  /**
   * Creates a NDKVoiceReply from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKVoiceReply from.
   * @returns NDKVoiceReply
   */
  static from(event) {
    return new _NDKVoiceReply(event.ndk, event);
  }
  /**
   * Getter for the audio URL.
   *
   * @returns {string | undefined} - The audio file URL if available, otherwise undefined.
   */
  get url() {
    return this.content || void 0;
  }
  /**
   * Setter for the audio URL.
   *
   * @param {string | undefined} url - The audio URL to set for the voice reply.
   */
  set url(url) {
    this.content = url || "";
  }
  /**
   * Getter for the waveform data from imeta tag.
   *
   * @returns {number[] | undefined} - Array of amplitude values if available, otherwise undefined.
   */
  get waveform() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (!imetaTag) return void 0;
    const waveformValue = imetaTag.find((value) => value.startsWith("waveform "));
    if (!waveformValue) return void 0;
    const waveformStr = waveformValue.replace("waveform ", "");
    return waveformStr.split(" ").map((v) => parseInt(v, 10));
  }
  /**
   * Setter for the waveform data in imeta tag.
   *
   * @param {number[] | undefined} waveform - Array of amplitude values (0-100).
   */
  set waveform(waveform) {
    this.removeTag("imeta");
    if (waveform && waveform.length > 0) {
      const imetaTag = ["imeta", `url ${this.content}`];
      imetaTag.push(`waveform ${waveform.join(" ")}`);
      const duration = this.duration;
      if (duration !== void 0) {
        imetaTag.push(`duration ${duration}`);
      }
      this.tags.push(imetaTag);
    }
  }
  /**
   * Getter for the audio duration in seconds from imeta tag.
   *
   * @returns {number | undefined} - The audio duration in seconds if available, otherwise undefined.
   */
  get duration() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (!imetaTag) return void 0;
    const durationValue = imetaTag.find((value) => value.startsWith("duration "));
    if (!durationValue) return void 0;
    const durationStr = durationValue.replace("duration ", "");
    return parseInt(durationStr, 10);
  }
  /**
   * Setter for the audio duration in imeta tag.
   *
   * @param {number | undefined} duration - The audio duration in seconds.
   */
  set duration(duration) {
    const existingImeta = this.tags.find((tag) => tag[0] === "imeta");
    if (duration !== void 0) {
      if (existingImeta) {
        const durationIndex = existingImeta.findIndex((v) => v.startsWith("duration "));
        if (durationIndex > 0) {
          existingImeta[durationIndex] = `duration ${duration}`;
        } else {
          existingImeta.push(`duration ${duration}`);
        }
      } else {
        const imetaTag = ["imeta", `url ${this.content}`, `duration ${duration}`];
        this.tags.push(imetaTag);
      }
    } else if (existingImeta) {
      const filtered = existingImeta.filter((v) => !v.startsWith("duration "));
      if (filtered.length <= 1) {
        this.removeTag("imeta");
      } else {
        const index = this.tags.indexOf(existingImeta);
        this.tags[index] = filtered;
      }
    }
  }
};
function dedup(event1, event2) {
  if (event1.created_at > event2.created_at) {
    return event1;
  }
  return event2;
}
async function getRelayListForUser(pubkey, ndk) {
  const list = await getRelayListForUsers([pubkey], ndk);
  return list.get(pubkey);
}
async function getRelayListForUsers(pubkeys, ndk, skipCache = false, timeout = 1e3, relayHints) {
  const pool = ndk.outboxPool || ndk.pool;
  const set = /* @__PURE__ */ new Set();
  for (const relay of pool.relays.values()) set.add(relay);
  if (relayHints) {
    for (const hints of relayHints.values()) {
      for (const url of hints) {
        const relay = pool.getRelay(url, true, true);
        if (relay) set.add(relay);
      }
    }
  }
  const relayLists = /* @__PURE__ */ new Map();
  const fromContactList = /* @__PURE__ */ new Map();
  const relaySet = new NDKRelaySet(set, ndk);
  if (ndk.cacheAdapter?.locking && !skipCache) {
    const cachedList = await ndk.fetchEvents(
      { kinds: [3, 10002], authors: Array.from(new Set(pubkeys)) },
      { cacheUsage: "ONLY_CACHE", subId: "ndk-relay-list-fetch" }
    );
    for (const relayList of cachedList) {
      if (relayList.kind === 10002) relayLists.set(relayList.pubkey, NDKRelayList.from(relayList));
    }
    for (const relayList of cachedList) {
      if (relayList.kind === 3) {
        if (relayLists.has(relayList.pubkey)) continue;
        const list = relayListFromKind3(ndk, relayList);
        if (list) fromContactList.set(relayList.pubkey, list);
      }
    }
    pubkeys = pubkeys.filter((pubkey) => !relayLists.has(pubkey) && !fromContactList.has(pubkey));
  }
  if (pubkeys.length === 0) return relayLists;
  const relayListEvents = /* @__PURE__ */ new Map();
  const contactListEvents = /* @__PURE__ */ new Map();
  return new Promise((resolve) => {
    let resolved = false;
    const handleSubscription = async () => {
      const subscribeOpts = {
        closeOnEose: true,
        pool,
        groupable: true,
        subId: "ndk-relay-list-fetch",
        addSinceFromCache: true,
        relaySet
      };
      if (relaySet) subscribeOpts.relaySet = relaySet;
      const sub = ndk.subscribe({ kinds: [3, 10002], authors: pubkeys }, subscribeOpts, {
        onEvent: (event) => {
          if (event.kind === 10002) {
            const existingEvent = relayListEvents.get(event.pubkey);
            if (existingEvent && existingEvent.created_at > event.created_at) return;
            relayListEvents.set(event.pubkey, event);
          } else if (event.kind === 3) {
            const existingEvent = contactListEvents.get(event.pubkey);
            if (existingEvent && existingEvent.created_at > event.created_at) return;
            contactListEvents.set(event.pubkey, event);
          }
        },
        onEose: () => {
          if (resolved) return;
          resolved = true;
          ndk.debug(
            `[getRelayListForUsers] EOSE - relayListEvents: ${relayListEvents.size}, contactListEvents: ${contactListEvents.size}`
          );
          for (const event of relayListEvents.values()) {
            relayLists.set(event.pubkey, NDKRelayList.from(event));
          }
          for (const pubkey of pubkeys) {
            if (relayLists.has(pubkey)) continue;
            const contactList = contactListEvents.get(pubkey);
            if (!contactList) continue;
            const list = relayListFromKind3(ndk, contactList);
            if (list) relayLists.set(pubkey, list);
          }
          ndk.debug(
            `[getRelayListForUsers] Returning ${relayLists.size} relay lists for ${pubkeys.length} pubkeys`
          );
          resolve(relayLists);
        }
      });
      const hasDisconnectedRelays = Array.from(set).some(
        (relay) => relay.status <= 2
        // DISCONNECTING, DISCONNECTED, or RECONNECTING
      );
      const hasConnectingRelays = Array.from(set).some(
        (relay) => relay.status === 4
        // CONNECTING
      );
      let effectiveTimeout = timeout;
      if (hasDisconnectedRelays || hasConnectingRelays) {
        effectiveTimeout = timeout + 3e3;
      }
      ndk.debug(
        `[getRelayListForUsers] Setting fallback timeout to ${effectiveTimeout}ms (disconnected: ${hasDisconnectedRelays}, connecting: ${hasConnectingRelays})`,
        { pubkeys }
      );
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ndk.debug(`[getRelayListForUsers] Timeout reached, returning ${relayLists.size} relay lists`);
          resolve(relayLists);
        }
      }, effectiveTimeout);
    };
    handleSubscription();
  });
}
var OutboxItem = class {
  /**
   * Type of item
   */
  type;
  /**
   * The relay URLs that are of interest to this item
   */
  relayUrlScores;
  readRelays;
  writeRelays;
  constructor(type) {
    this.type = type;
    this.relayUrlScores = /* @__PURE__ */ new Map();
    this.readRelays = /* @__PURE__ */ new Set();
    this.writeRelays = /* @__PURE__ */ new Set();
  }
};
var OutboxTracker = class extends import_tseep6.EventEmitter {
  data;
  ndk;
  debug;
  constructor(ndk) {
    super();
    this.ndk = ndk;
    this.debug = ndk.debug.extend("outbox-tracker");
    this.data = new import_typescript_lru_cache2.LRUCache({
      maxSize: 1e5,
      entryExpirationTimeInMS: 2 * 60 * 1e3
    });
  }
  /**
   * Adds a list of users to the tracker.
   * @param items
   * @param skipCache
   */
  async trackUsers(items, skipCache = false) {
    const promises = [];
    for (let i2 = 0; i2 < items.length; i2 += 400) {
      const slice = items.slice(i2, i2 + 400);
      const pubkeys = slice.map((item) => getKeyFromItem(item)).filter((pubkey) => !this.data.has(pubkey));
      if (pubkeys.length === 0) continue;
      for (const pubkey of pubkeys) {
        this.data.set(pubkey, new OutboxItem("user"));
      }
      const relayHints = /* @__PURE__ */ new Map();
      for (const item of slice) {
        if (item instanceof NDKUser && item.relayUrls.length > 0) {
          relayHints.set(item.pubkey, item.relayUrls);
        }
      }
      promises.push(
        new Promise((resolve) => {
          getRelayListForUsers(pubkeys, this.ndk, skipCache, 1e3, relayHints).then((relayLists) => {
            this.debug(
              `Received relay lists for ${relayLists.size} pubkeys out of ${pubkeys.length} requested`
            );
            for (const [pubkey, relayList] of relayLists) {
              let outboxItem = this.data.get(pubkey);
              outboxItem ??= new OutboxItem("user");
              if (relayList) {
                outboxItem.readRelays = new Set(normalize(relayList.readRelayUrls));
                outboxItem.writeRelays = new Set(normalize(relayList.writeRelayUrls));
                if (this.ndk.relayConnectionFilter) {
                  for (const relayUrl of outboxItem.readRelays) {
                    if (!this.ndk.relayConnectionFilter(relayUrl)) {
                      outboxItem.readRelays.delete(relayUrl);
                    }
                  }
                  for (const relayUrl of outboxItem.writeRelays) {
                    if (!this.ndk.relayConnectionFilter(relayUrl)) {
                      outboxItem.writeRelays.delete(relayUrl);
                    }
                  }
                }
                this.data.set(pubkey, outboxItem);
                this.emit("user:relay-list-updated", pubkey, outboxItem);
                this.debug(
                  `Adding ${outboxItem.readRelays.size} read relays and ${outboxItem.writeRelays.size} write relays for ${pubkey}`,
                  relayList?.rawEvent()
                );
              }
            }
          }).finally(resolve);
        })
      );
    }
    return Promise.all(promises);
  }
  /**
   *
   * @param key
   * @param score
   */
  track(item, type, _skipCache = true) {
    const key = getKeyFromItem(item);
    type ??= getTypeFromItem(item);
    let outboxItem = this.data.get(key);
    if (!outboxItem) {
      outboxItem = new OutboxItem(type);
      if (item instanceof NDKUser) {
        this.trackUsers([item]);
      }
    }
    return outboxItem;
  }
};
function getKeyFromItem(item) {
  if (item instanceof NDKUser) {
    return item.pubkey;
  }
  return item;
}
function getTypeFromItem(item) {
  if (item instanceof NDKUser) {
    return "user";
  }
  return "kind";
}
function correctRelaySet(relaySet, pool) {
  const connectedRelays = pool.connectedRelays();
  const includesConnectedRelay = Array.from(relaySet.relays).some((relay) => {
    return connectedRelays.map((r) => r.url).includes(relay.url);
  });
  if (!includesConnectedRelay) {
    for (const relay of connectedRelays) {
      relaySet.addRelay(relay);
    }
  }
  if (connectedRelays.length === 0) {
    for (const relay of pool.relays.values()) {
      relaySet.addRelay(relay);
    }
  }
  return relaySet;
}
var NDKSubscriptionManager = class {
  subscriptions;
  // Use LRU cache instead of unbounded Map to prevent memory leaks
  seenEvents = new import_typescript_lru_cache3.LRUCache({
    maxSize: 1e4,
    // Keep last 10k events
    entryExpirationTimeInMS: 5 * 60 * 1e3
    // 5 minutes
  });
  constructor() {
    this.subscriptions = /* @__PURE__ */ new Map();
  }
  add(sub) {
    this.subscriptions.set(sub.internalId, sub);
    if (sub.onStopped) {
    }
    sub.onStopped = () => {
      this.subscriptions.delete(sub.internalId);
    };
    sub.on("close", () => {
      this.subscriptions.delete(sub.internalId);
    });
  }
  seenEvent(eventId, relay) {
    const current = this.seenEvents.get(eventId) || [];
    if (!current.some((r) => r.url === relay.url)) {
      current.push(relay);
    }
    this.seenEvents.set(eventId, current);
  }
  /**
   * Whenever an event comes in, this function is called.
   * This function matches the received event against all the
   * known (i.e. active) NDKSubscriptions, and if it matches,
   * it sends the event to the subscription.
   *
   * This is the single place in the codebase that matches
   * incoming events with parties interested in the event.
   *
   * This is also what allows for reactivity in NDK apps, such that
   * whenever an active subscription receives an event that some
   * other active subscription would want to receive, both receive it.
   *
   * TODO This also allows for subscriptions that overlap in meaning
   * to be collapsed into one.
   *
   * I.e. if a subscription with filter: kinds: [1], authors: [alice]
   * is created and EOSEs, and then a subsequent subscription with
   * kinds: [1], authors: [alice] is created, once the second subscription
   * EOSEs we can safely close it, increment its refCount and close it,
   * and when the first subscription receives a new event from Alice this
   * code will make the second subscription receive the event even though
   * it has no active subscription on a relay.
   * @param event Raw event received from a relay
   * @param relay Relay that sent the event
   * @param optimisticPublish Whether the event is coming from an optimistic publish
   */
  dispatchEvent(event, relay, optimisticPublish = false) {
    if (relay) this.seenEvent(event.id, relay);
    const subscriptions = this.subscriptions.values();
    const matchingSubs = [];
    for (const sub of subscriptions) {
      if (matchFilters(sub.filters, event)) {
        matchingSubs.push(sub);
      }
    }
    for (const sub of matchingSubs) {
      if (sub.exclusiveRelay && sub.relaySet) {
        let shouldAccept = false;
        if (optimisticPublish) {
          shouldAccept = !sub.skipOptimisticPublishEvent;
        } else if (!relay) {
          const eventOnRelays = this.seenEvents.get(event.id) || [];
          shouldAccept = eventOnRelays.some((r) => sub.relaySet.relays.has(r));
        } else {
          shouldAccept = sub.relaySet.relays.has(relay);
        }
        if (!shouldAccept) {
          sub.debug.extend("exclusive-relay")(
            "Rejected event %s from %s (relay not in exclusive set)",
            event.id,
            relay?.url || (optimisticPublish ? "optimistic" : "cache")
          );
          continue;
        }
      }
      sub.eventReceived(event, relay, false, optimisticPublish);
    }
  }
};
var debug6 = (0, import_debug8.default)("ndk:active-user");
async function getUserRelayList(user) {
  if (!this.autoConnectUserRelays) return;
  const userRelays = await getRelayListForUser(user.pubkey, this);
  if (!userRelays) return;
  for (const url of userRelays.relays) {
    let relay = this.pool.relays.get(url);
    if (!relay) {
      relay = new NDKRelay(url, this.relayAuthDefaultPolicy, this);
      this.pool.addRelay(relay);
    }
  }
  debug6("Connected to %d user relays", userRelays.relays.length);
  return userRelays;
}
async function setActiveUser(user) {
  if (!this.autoConnectUserRelays) return;
  const pool = this.outboxPool || this.pool;
  if (pool.connectedRelays.length > 0) {
    await getUserRelayList.call(this, user);
  } else {
    pool.once("connect", async () => {
      await getUserRelayList.call(this, user);
    });
  }
}
function getEntity(entity) {
  try {
    const decoded = nip19_exports.decode(entity);
    if (decoded.type === "npub") return npub(this, decoded.data);
    if (decoded.type === "nprofile") return nprofile(this, decoded.data);
    return decoded;
  } catch (_e) {
    return null;
  }
}
function npub(ndk, pubkey) {
  return ndk.getUser({ pubkey });
}
function nprofile(ndk, profile) {
  const user = ndk.getUser({ pubkey: profile.pubkey });
  if (profile.relays) user.relayUrls = profile.relays;
  return user;
}
function isValidHint(hint) {
  if (!hint || hint === "") return false;
  try {
    new URL(hint);
    return true;
  } catch (_e) {
    return false;
  }
}
async function fetchEventFromTag(tag, originalEvent, subOpts, fallback = {
  type: "timeout"
}) {
  const d4 = this.debug.extend("fetch-event-from-tag");
  const [_, id, hint] = tag;
  subOpts = {};
  d4("fetching event from tag", tag, subOpts, fallback);
  const authorRelays = getRelaysForSync(this, originalEvent.pubkey);
  if (authorRelays && authorRelays.size > 0) {
    d4("fetching event from author relays %o", Array.from(authorRelays));
    const relaySet2 = NDKRelaySet.fromRelayUrls(Array.from(authorRelays), this);
    const event2 = await this.fetchEvent(id, subOpts, relaySet2);
    if (event2) return event2;
  } else {
    d4("no author relays found for %s", originalEvent.pubkey, originalEvent);
  }
  const relaySet = calculateRelaySetsFromFilters(this, [{ ids: [id] }], this.pool);
  d4("fetching event without relay hint", relaySet);
  const event = await this.fetchEvent(id, subOpts);
  if (event) return event;
  if (hint && hint !== "") {
    const event2 = await this.fetchEvent(id, subOpts, this.pool.getRelay(hint, true, true, [{ ids: [id] }]));
    if (event2) return event2;
  }
  let result;
  const relay = isValidHint(hint) ? this.pool.getRelay(hint, false, true, [{ ids: [id] }]) : void 0;
  const fetchMaybeWithRelayHint = new Promise((resolve) => {
    this.fetchEvent(id, subOpts, relay).then(resolve);
  });
  if (!isValidHint(hint) || fallback.type === "none") {
    return fetchMaybeWithRelayHint;
  }
  const fallbackFetchPromise = new Promise(async (resolve) => {
    const fallbackRelaySet = fallback.relaySet;
    const timeout = fallback.timeout ?? 1500;
    const timeoutPromise = new Promise((resolve2) => setTimeout(resolve2, timeout));
    if (fallback.type === "timeout") await timeoutPromise;
    if (result) {
      resolve(result);
    } else {
      d4("fallback fetch triggered");
      const fallbackEvent = await this.fetchEvent(id, subOpts, fallbackRelaySet);
      resolve(fallbackEvent);
    }
  });
  switch (fallback.type) {
    case "timeout":
      return Promise.race([fetchMaybeWithRelayHint, fallbackFetchPromise]);
    case "eose":
      result = await fetchMaybeWithRelayHint;
      if (result) return result;
      return fallbackFetchPromise;
  }
}
var Queue = class {
  queue = [];
  maxConcurrency;
  processing = /* @__PURE__ */ new Set();
  promises = /* @__PURE__ */ new Map();
  constructor(_name, maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
  }
  add(item) {
    if (this.promises.has(item.id)) {
      return this.promises.get(item.id);
    }
    const promise = new Promise((resolve, reject) => {
      this.queue.push({
        ...item,
        func: () => item.func().then(
          (result) => {
            resolve(result);
            return result;
          },
          (error) => {
            reject(error);
            throw error;
          }
        )
      });
      this.process();
    });
    this.promises.set(item.id, promise);
    promise.finally(() => {
      this.promises.delete(item.id);
      this.processing.delete(item.id);
      this.process();
    });
    return promise;
  }
  process() {
    if (this.processing.size >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    const item = this.queue.shift();
    if (!item || this.processing.has(item.id)) {
      return;
    }
    this.processing.add(item.id);
    item.func();
  }
  clear() {
    this.queue = [];
  }
  clearProcessing() {
    this.processing.clear();
  }
  clearAll() {
    this.clear();
    this.clearProcessing();
  }
  length() {
    return this.queue.length;
  }
};
var DEFAULT_OUTBOX_RELAYS = ["wss://purplepag.es/", "wss://nos.lol/"];
var NDK = class extends import_tseep5.EventEmitter {
  _explicitRelayUrls;
  pool;
  outboxPool;
  _signer;
  _activeUser;
  cacheAdapter;
  debug;
  devWriteRelaySet;
  outboxTracker;
  muteFilter;
  relayConnectionFilter;
  clientName;
  clientNip89;
  queuesZapConfig;
  queuesNip05;
  asyncSigVerification = false;
  initialValidationRatio = 1;
  lowestValidationRatio = 0.1;
  validationRatioFn;
  filterValidationMode = "validate";
  subManager;
  aiGuardrails;
  futureTimestampGrace;
  /**
   * Private storage for the signature verification function
   */
  _signatureVerificationFunction;
  /**
   * Private storage for the signature verification worker
   */
  _signatureVerificationWorker;
  /**
   * Rolling total of time spent (in ms) performing signature verifications.
   * Users can read this to monitor or display aggregate verification cost.
   */
  signatureVerificationTimeMs = 0;
  publishingFailureHandled = false;
  pools = [];
  /**
   * Default relay-auth policy that will be used when a relay requests authentication,
   * if no other policy is specified for that relay.
   *
   * @example Disconnect from relays that request authentication:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.disconnect(ndk.pool);
   * ```
   *
   * @example Sign in to relays that request authentication:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.signIn({ndk})
   * ```
   *
   * @example Sign in to relays that request authentication, asking the user for confirmation:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
   *     const signIn = NDKAuthPolicies.signIn({ndk});
   *     if (confirm(`Relay ${relay.url} is requesting authentication, do you want to sign in?`)) {
   *        signIn(relay);
   *     }
   * }
   * ```
   */
  relayAuthDefaultPolicy;
  /**
   * Fetch function to use for HTTP requests.
   *
   * @example
   * ```typescript
   * import fetch from "node-fetch";
   *
   * ndk.httpFetch = fetch;
   * ```
   */
  httpFetch;
  /**
   * Provide a caller function to receive all networking traffic from relays
   */
  netDebug;
  autoConnectUserRelays = true;
  _wallet;
  walletConfig;
  constructor(opts = {}) {
    super();
    this.debug = opts.debug || (0, import_debug7.default)("ndk");
    this.netDebug = opts.netDebug;
    this._explicitRelayUrls = opts.explicitRelayUrls || [];
    this.subManager = new NDKSubscriptionManager();
    this.pool = new NDKPool(opts.explicitRelayUrls || [], this);
    this.pool.name = "Main";
    this.pool.on("relay:auth", async (relay, challenge3) => {
      if (this.relayAuthDefaultPolicy) {
        await this.relayAuthDefaultPolicy(relay, challenge3);
      }
    });
    this.autoConnectUserRelays = opts.autoConnectUserRelays ?? true;
    this.clientName = opts.clientName;
    this.clientNip89 = opts.clientNip89;
    this.relayAuthDefaultPolicy = opts.relayAuthDefaultPolicy;
    if (!(opts.enableOutboxModel === false)) {
      this.outboxPool = new NDKPool(opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS, this, {
        debug: this.debug.extend("outbox-pool"),
        name: "Outbox Pool"
      });
      this.outboxTracker = new OutboxTracker(this);
      this.outboxTracker.on("user:relay-list-updated", (pubkey, _outboxItem) => {
        this.debug(`Outbox relay list updated for ${pubkey}`);
        for (const subscription of this.subManager.subscriptions.values()) {
          const isRelevant = subscription.filters.some((filter) => filter.authors?.includes(pubkey));
          if (isRelevant && typeof subscription.refreshRelayConnections === "function") {
            this.debug(`Refreshing relay connections for subscription ${subscription.internalId}`);
            subscription.refreshRelayConnections();
          }
        }
      });
    }
    this.signer = opts.signer;
    this.cacheAdapter = opts.cacheAdapter;
    this.muteFilter = opts.muteFilter;
    this.relayConnectionFilter = opts.relayConnectionFilter;
    if (opts.devWriteRelayUrls) {
      this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
    }
    this.queuesZapConfig = new Queue("zaps", 3);
    this.queuesNip05 = new Queue("nip05", 10);
    if (opts.signatureVerificationWorker) {
      this.signatureVerificationWorker = opts.signatureVerificationWorker;
    }
    if (opts.signatureVerificationFunction) {
      this.signatureVerificationFunction = opts.signatureVerificationFunction;
    }
    this.initialValidationRatio = opts.initialValidationRatio || 1;
    this.lowestValidationRatio = opts.lowestValidationRatio || 0.1;
    this.validationRatioFn = opts.validationRatioFn || this.defaultValidationRatioFn;
    this.filterValidationMode = opts.filterValidationMode || "validate";
    this.aiGuardrails = new AIGuardrails(opts.aiGuardrails || false);
    this.futureTimestampGrace = opts.futureTimestampGrace;
    this.aiGuardrails.ndkInstantiated(this);
    try {
      this.httpFetch = fetch;
    } catch {
    }
  }
  set explicitRelayUrls(urls) {
    this._explicitRelayUrls = urls.map(normalizeRelayUrl);
    this.pool.relayUrls = urls;
  }
  get explicitRelayUrls() {
    return this._explicitRelayUrls || [];
  }
  /**
   * Set a Web Worker for signature verification.
   *
   * This method initializes the worker and sets the asyncSigVerification flag.
   * The actual verification is handled by the verifySignatureAsync function in signature.ts,
   * which will use the worker if available.
   */
  set signatureVerificationWorker(worker2) {
    this._signatureVerificationWorker = worker2;
    if (worker2) {
      signatureVerificationInit(worker2);
      this.asyncSigVerification = true;
    } else {
      this.asyncSigVerification = false;
    }
  }
  /**
   * Set a custom signature verification function.
   *
   * This method is particularly useful for platforms that don't support Web Workers,
   * such as React Native.
   *
   * When a function is provided, it will be used for signature verification
   * instead of the default worker-based verification. This enables signature
   * verification on platforms where Web Workers are not available.
   *
   * @example
   * ```typescript
   * import { verifySignatureAsync } from "@nostr-dev-kit/mobile";
   *
   * ndk.signatureVerificationFunction = verifySignatureAsync;
   * ```
   */
  set signatureVerificationFunction(fn) {
    this._signatureVerificationFunction = fn;
    this.asyncSigVerification = !!fn;
  }
  /**
   * Get the custom signature verification function
   */
  get signatureVerificationFunction() {
    return this._signatureVerificationFunction;
  }
  /**
   * Adds an explicit relay to the pool.
   * @param url
   * @param relayAuthPolicy Authentication policy to use if different from the default
   * @param connect Whether to connect to the relay automatically
   * @returns
   */
  addExplicitRelay(urlOrRelay, relayAuthPolicy, connect = true) {
    let relay;
    if (typeof urlOrRelay === "string") {
      relay = new NDKRelay(urlOrRelay, relayAuthPolicy, this);
    } else {
      relay = urlOrRelay;
    }
    this.pool.addRelay(relay, connect);
    this.explicitRelayUrls?.push(relay.url);
    return relay;
  }
  toJSON() {
    return { relayCount: this.pool.relays.size }.toString();
  }
  get activeUser() {
    return this._activeUser;
  }
  /**
   * Sets the active user for this NDK instance, typically this will be
   * called when assigning a signer to the NDK instance.
   *
   * This function will automatically connect to the user's relays if
   * `autoConnectUserRelays` is set to true.
   */
  set activeUser(user) {
    const differentUser = this._activeUser?.pubkey !== user?.pubkey;
    this._activeUser = user;
    if (differentUser) {
      this.emit("activeUser:change", user);
    }
    if (user && differentUser) {
      setActiveUser.call(this, user);
    }
  }
  get signer() {
    return this._signer;
  }
  set signer(newSigner) {
    this._signer = newSigner;
    if (newSigner) this.emit("signer:ready", newSigner);
    newSigner?.user().then((user) => {
      user.ndk = this;
      this.activeUser = user;
    });
  }
  /**
   * Connect to relays with optional timeout.
   * If the timeout is reached, the connection will be continued to be established in the background.
   */
  async connect(timeoutMs) {
    if (this._signer && this.autoConnectUserRelays) {
      this.debug(
        "Attempting to connect to user relays specified by signer %o",
        await this._signer.relays?.(this)
      );
      if (this._signer.relays) {
        const relays = await this._signer.relays(this);
        relays.forEach((relay) => this.pool.addRelay(relay));
      }
    }
    const connections = [this.pool.connect(timeoutMs)];
    if (this.outboxPool) {
      connections.push(this.outboxPool.connect(timeoutMs));
    }
    if (this.cacheAdapter?.initializeAsync) {
      connections.push(this.cacheAdapter.initializeAsync(this));
    }
    return Promise.allSettled(connections).then(() => {
    });
  }
  /**
   * Centralized method to report an invalid signature, identifying the relay that provided it.
   * A single invalid signature means the relay is considered malicious.
   * All invalid signature detections (synchronous or asynchronous) should delegate to this method.
   *
   * @param event The event with an invalid signature
   * @param relay The relay that provided the invalid signature
   */
  reportInvalidSignature(event, relay) {
    this.debug(`Invalid signature detected for event ${event.id}${relay ? ` from relay ${relay.url}` : ""}`);
    this.emit("event:invalid-sig", event, relay);
  }
  /**
   * Default function to calculate validation ratio based on historical validation results.
   * The more events validated successfully, the lower the ratio goes (down to the minimum).
   */
  defaultValidationRatioFn(_relay, validatedCount, _nonValidatedCount) {
    if (validatedCount < 10) return this.initialValidationRatio;
    const trustFactor = Math.min(validatedCount / 100, 1);
    const calculatedRatio = this.initialValidationRatio * (1 - trustFactor) + this.lowestValidationRatio * trustFactor;
    return Math.max(calculatedRatio, this.lowestValidationRatio);
  }
  /**
   * Get a NDKUser object
   *
   * @deprecated Use `fetchUser` instead - this method will be removed in the next major version
   * @param opts - User parameters object or a string (npub, nprofile, or hex pubkey)
   * @returns NDKUser instance
   *
   * @example
   * ```typescript
   * // Using parameters object
   * const user1 = ndk.getUser({ pubkey: "hex..." });
   *
   * // Using npub string
   * const user2 = ndk.getUser("npub1...");
   *
   * // Using nprofile string (includes relay hints)
   * const user3 = ndk.getUser("nprofile1...");
   *
   * // Using hex pubkey directly
   * const user4 = ndk.getUser("deadbeef...");
   * ```
   */
  getUser(opts) {
    if (typeof opts === "string") {
      if (opts.startsWith("npub1")) {
        const { type, data } = nip19_exports.decode(opts);
        if (type !== "npub") throw new Error(`Invalid npub: ${opts}`);
        return this.getUser({ pubkey: data });
      } else if (opts.startsWith("nprofile1")) {
        const { type, data } = nip19_exports.decode(opts);
        if (type !== "nprofile") throw new Error(`Invalid nprofile: ${opts}`);
        return this.getUser({
          pubkey: data.pubkey,
          relayUrls: data.relays
        });
      } else {
        return this.getUser({ pubkey: opts });
      }
    }
    const user = new NDKUser(opts);
    user.ndk = this;
    return user;
  }
  /**
   * Get a NDKUser from a NIP05
   * @deprecated Use `fetchUser` instead - this method will be removed in the next major version
   * @param nip05 NIP-05 ID
   * @param skipCache Skip cache
   * @returns
   */
  async getUserFromNip05(nip05, skipCache = false) {
    return NDKUser.fromNip05(nip05, this, skipCache);
  }
  /**
   * Fetch a NDKUser from a string identifier
   *
   * Supports multiple input formats:
   * - NIP-05 identifiers (e.g., "pablo@test.com" or "test.com")
   * - npub (NIP-19 encoded public key)
   * - nprofile (NIP-19 encoded profile with optional relay hints)
   * - Hex public key
   *
   * @param input - String identifier for the user (NIP-05, npub, nprofile, or hex pubkey)
   * @param skipCache - Skip cache when resolving NIP-05 (only applies to NIP-05 lookups)
   * @returns Promise resolving to NDKUser or undefined if not found
   *
   * @example
   * ```typescript
   * // Using NIP-05
   * const user1 = await ndk.fetchUser("pablo@test.com");
   * const user2 = await ndk.fetchUser("test.com"); // defaults to _@test.com
   *
   * // Using npub
   * const user3 = await ndk.fetchUser("npub1...");
   *
   * // Using nprofile (includes relay hints)
   * const user4 = await ndk.fetchUser("nprofile1...");
   *
   * // Using hex pubkey
   * const user5 = await ndk.fetchUser("deadbeef...");
   * ```
   */
  async fetchUser(input, skipCache = false) {
    if (isValidNip05(input)) {
      return NDKUser.fromNip05(input, this, skipCache);
    } else if (input.startsWith("npub1")) {
      const { type, data } = nip19_exports.decode(input);
      if (type !== "npub") throw new Error(`Invalid npub: ${input}`);
      const user = new NDKUser({ pubkey: data });
      user.ndk = this;
      return user;
    } else if (input.startsWith("nprofile1")) {
      const { type, data } = nip19_exports.decode(input);
      if (type !== "nprofile") throw new Error(`Invalid nprofile: ${input}`);
      const user = new NDKUser({
        pubkey: data.pubkey,
        relayUrls: data.relays
      });
      user.ndk = this;
      return user;
    } else {
      const user = new NDKUser({ pubkey: input });
      user.ndk = this;
      return user;
    }
  }
  /**
   * Creates and starts a new subscription.
   *
   * Subscriptions automatically start unless `autoStart` is set to `false`.
   * You can control automatic closing on EOSE via `opts.closeOnEose`.
   *
   * @param filters - A single NDKFilter object or an array of filters.
   * @param opts - Optional NDKSubscriptionOptions to customize behavior (e.g., caching, grouping).
   * @param handlers - Optional handlers for subscription events. Passing handlers is the preferred method of using ndk.subscribe.
   *   - `onEvent`: Called for each event received.
   *  - `onEvents`: Called once with an array of events when the subscription starts (from the cache).
   *  - `onEose`: Called when the subscription receives EOSE.
   *  For backwards compatibility, this third parameter also accepts a relaySet, the relaySet should be passed via `opts.relaySet`.
   *
   * @param _autoStart - For backwards compatibility, this can be a boolean indicating whether to start the subscription immediately.
   *  This parameter is deprecated and will be removed in a future version.
   *   - `false`: Creates the subscription but does not start it (call `subscription.start()` manually).
   * @returns The created NDKSubscription instance.
   *
   * @example Basic subscription
   * ```typescript
   * const sub = ndk.subscribe(
   *   { kinds: [1], authors: [pubkey] },
   *   {
   *     onEvent: (event) => console.log("Kind 1 event:", event.content)
   *   }
   * );
   * ```
   *
   * @example Subscription with options and direct handlers
   * ```typescript
   * const sub = ndk.subscribe(
   *   { kinds: [0], authors: [pubkey] },
   *   { 
   *     closeOnEose: true,
   *     cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
   *     onEvents: (events) => console.log(`Got ${events.length} profile events from cache:`, events[0].content),
   *     onEvent: (event) => console.log("Got profile update from relay:", event.content),
   *     onEose: () => console.log("Profile subscription finished.")
   *   }
   * );
   * ```
   *
   * @since 2.13.0 `relaySet` parameter removed; pass `relaySet` or `relayUrls` via `opts`.
   */
  subscribe(filters, opts, autoStartOrRelaySet = true, _autoStart = true) {
    let _relaySet = opts?.relaySet;
    let autoStart = _autoStart;
    if (autoStartOrRelaySet instanceof NDKRelaySet) {
      console.warn("relaySet is deprecated, use opts.relaySet instead. This will be removed in version v2.14.0");
      _relaySet = autoStartOrRelaySet;
      autoStart = _autoStart;
    } else if (typeof autoStartOrRelaySet === "boolean" || typeof autoStartOrRelaySet === "object") {
      autoStart = autoStartOrRelaySet;
    }
    const finalOpts = { relaySet: _relaySet, ...opts };
    if (autoStart && typeof autoStart === "object") {
      if (autoStart.onEvent) finalOpts.onEvent = autoStart.onEvent;
      if (autoStart.onEose) finalOpts.onEose = autoStart.onEose;
      if (autoStart.onClose) finalOpts.onClose = autoStart.onClose;
      if (autoStart.onEvents) finalOpts.onEvents = autoStart.onEvents;
    }
    const subscription = new NDKSubscription(this, filters, finalOpts);
    this.subManager.add(subscription);
    this.aiGuardrails?.subscription?.created(Array.isArray(filters) ? filters : [filters], finalOpts);
    const pool = subscription.pool;
    if (subscription.relaySet) {
      for (const relay of subscription.relaySet.relays) {
        pool.useTemporaryRelay(relay, void 0, subscription.filters);
      }
    }
    if (this.outboxPool && subscription.hasAuthorsFilter()) {
      const authors = subscription.filters.filter((filter) => filter.authors && filter.authors?.length > 0).flatMap((filter) => filter.authors);
      this.outboxTracker?.trackUsers(authors);
    }
    if (autoStart) {
      setTimeout(async () => {
        if (this.cacheAdapter?.initializeAsync && !this.cacheAdapter.ready) {
          await this.cacheAdapter.initializeAsync(this);
        }
        subscription.start();
      }, 0);
    }
    return subscription;
  }
  /**
   * Attempts to fetch an event from a tag, following relay hints and
   * other best practices.
   * @param tag Tag to fetch the event from
   * @param originalEvent Event where the tag came from
   * @param subOpts Subscription options to use when fetching the event
   * @param fallback Fallback options to use when the hint relay doesn't respond
   * @returns
   */
  fetchEventFromTag = fetchEventFromTag.bind(this);
  /**
   * Fetch an event from the cache synchronously.
   * @param idOrFilter event id in bech32 format or filter
   * @returns events from the cache or null if the cache is empty
   */
  fetchEventSync(idOrFilter) {
    if (!this.cacheAdapter) throw new Error("Cache adapter not set");
    let filters;
    if (typeof idOrFilter === "string") filters = [filterFromId(idOrFilter)];
    else filters = idOrFilter;
    const sub = new NDKSubscription(this, filters);
    const events = this.cacheAdapter.query(sub);
    if (events instanceof Promise) throw new Error("Cache adapter is async");
    return events.map((e) => {
      e.ndk = this;
      return e;
    });
  }
  /**
   * Fetch a single event.
   *
   * @param idOrFilter event id in bech32 format or filter
   * @param opts subscription options
   * @param relaySetOrRelay explicit relay set to use
   */
  async fetchEvent(idOrFilter, opts, relaySetOrRelay) {
    let filters;
    let relaySet;
    if (relaySetOrRelay instanceof NDKRelay) {
      relaySet = new NDKRelaySet(/* @__PURE__ */ new Set([relaySetOrRelay]), this);
    } else if (relaySetOrRelay instanceof NDKRelaySet) {
      relaySet = relaySetOrRelay;
    }
    if (!relaySetOrRelay && typeof idOrFilter === "string") {
      if (!isNip33AValue(idOrFilter)) {
        const relays = relaysFromBech32(idOrFilter, this);
        if (relays.length > 0) {
          relaySet = new NDKRelaySet(new Set(relays), this);
          relaySet = correctRelaySet(relaySet, this.pool);
        }
      }
    }
    if (typeof idOrFilter === "string") {
      filters = [filterFromId(idOrFilter)];
    } else if (Array.isArray(idOrFilter)) {
      filters = idOrFilter;
    } else {
      filters = [idOrFilter];
    }
    if (typeof idOrFilter !== "string") {
      this.aiGuardrails?.ndk?.fetchingEvents(filters);
    }
    if (filters.length === 0) {
      throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
    }
    return new Promise((resolve, reject) => {
      let fetchedEvent = null;
      const processEvent = (event) => {
        event.ndk = this;
        if (!event.isReplaceable()) {
          clearTimeout(t2);
          s?.stop();
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(event);
        } else if (!fetchedEvent || fetchedEvent.created_at < event.created_at) {
          fetchedEvent = event;
        }
      };
      const subscribeOpts = {
        ...opts || {},
        closeOnEose: true,
        // Batch handler for cached events
        onEvents: (cachedEvents) => {
          for (const event of cachedEvents) {
            processEvent(event);
          }
        },
        // Individual handler for relay events
        onEvent: (event) => {
          processEvent(event);
        },
        onEose: () => {
          clearTimeout(t2);
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(fetchedEvent);
        }
      };
      if (relaySet) subscribeOpts.relaySet = relaySet;
      let s;
      const t2 = setTimeout(() => {
        s?.stop();
        this.aiGuardrails["_nextCallDisabled"] = null;
        resolve(fetchedEvent);
      }, 1e4);
      s = this.subscribe(filters, subscribeOpts);
    });
  }
  /**
   * Fetch events
   */
  async fetchEvents(filters, opts, relaySet) {
    this.aiGuardrails?.ndk?.fetchingEvents(filters, opts);
    return new Promise((resolve) => {
      const events = /* @__PURE__ */ new Map();
      const processEvent = (event) => {
        let _event;
        if (!(event instanceof NDKEvent)) _event = new NDKEvent(void 0, event);
        else _event = event;
        const dedupKey = _event.deduplicationKey();
        const existingEvent = events.get(dedupKey);
        if (existingEvent) {
          _event = dedup(existingEvent, _event);
        }
        _event.ndk = this;
        events.set(dedupKey, _event);
      };
      const subscribeOpts = {
        ...opts || {},
        closeOnEose: true,
        onEvents: (cachedEvents) => {
          for (const event of cachedEvents) {
            processEvent(event);
          }
        },
        onEvent: processEvent,
        onEose: () => {
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(new Set(events.values()));
        }
      };
      if (relaySet) subscribeOpts.relaySet = relaySet;
      const _relaySetSubscription = this.subscribe(filters, subscribeOpts);
    });
  }
  /**
   * Count events matching the given filters using NIP-45.
   *
   * This method queries multiple relays and aggregates their COUNT responses.
   * When relays return HyperLogLog (HLL) data, it uses the HLL algorithm to
   * provide accurate cardinality estimation without double-counting events
   * that appear on multiple relays.
   *
   * @param filters - The filters to count events for
   * @param opts - Optional count options (timeout, custom id)
   * @param relaySet - Optional relay set to use for the count request
   * @returns An aggregated count result with the best estimate and per-relay results
   *
   * @example Basic count
   * ```typescript
   * const result = await ndk.count([{ kinds: [1], authors: [pubkey] }]);
   * console.log(`Found approximately ${result.count} events`);
   * ```
   *
   * @example Count with specific relays
   * ```typescript
   * const relaySet = NDKRelaySet.fromRelayUrls(['wss://relay1.com', 'wss://relay2.com'], ndk);
   * const result = await ndk.count([{ kinds: [7], "#e": [eventId] }], {}, relaySet);
   * console.log(`Approximately ${result.count} reactions`);
   * ```
   *
   * @example Using HLL data for further analysis
   * ```typescript
   * const result = await ndk.count([{ kinds: [3] }]);
   * if (result.mergedHll) {
   *   console.log('HLL data available for further merging');
   * }
   * ```
   */
  async count(filters, opts = {}, relaySet) {
    const effectiveRelaySet = relaySet ?? NDKRelaySet.fromRelayUrls(
      Array.from(this.pool.relays.keys()),
      this,
      false
    );
    return effectiveRelaySet.count(filters, opts);
  }
  /**
   * Ensures that a signer is available to sign an event.
   */
  assertSigner() {
    if (!this.signer) {
      this.emit("signer:required");
      throw new Error("Signer required");
    }
  }
  getEntity = getEntity.bind(this);
  /**
   * Temporarily disable AI guardrails for the next method call.
   *
   * @param ids - Optional guardrail IDs to disable. If omitted, all guardrails are disabled for the next call.
   *              Can be a single string or an array of strings.
   * @returns This NDK instance for method chaining
   *
   * @example Disable all guardrails for one call
   * ```typescript
   * ndk.guardrailOff().fetchEvents({ kinds: [1] });
   * ```
   *
   * @example Disable specific guardrail
   * ```typescript
   * ndk.guardrailOff('fetch-events-usage').fetchEvents({ kinds: [1] });
   * ```
   *
   * @example Disable multiple guardrails
   * ```typescript
   * ndk.guardrailOff(['fetch-events-usage', 'filter-large-limit']).fetchEvents({ kinds: [1], limit: 5000 });
   * ```
   */
  guardrailOff(ids) {
    if (!ids) {
      this.aiGuardrails["_nextCallDisabled"] = "all";
    } else if (typeof ids === "string") {
      this.aiGuardrails["_nextCallDisabled"] = /* @__PURE__ */ new Set([ids]);
    } else {
      this.aiGuardrails["_nextCallDisabled"] = new Set(ids);
    }
    return this;
  }
  set wallet(wallet) {
    if (!wallet) {
      this._wallet = void 0;
      this.walletConfig = void 0;
      return;
    }
    this._wallet = wallet;
    this.walletConfig ??= {};
    this.walletConfig.lnPay = wallet?.lnPay?.bind(wallet);
    this.walletConfig.cashuPay = wallet?.cashuPay?.bind(wallet);
  }
  get wallet() {
    return this._wallet;
  }
};
var nip19_exports3 = {};
__reExport(nip19_exports3, nip19_exports2);
var nip49_exports2 = {};
__reExport(nip49_exports2, nip49_exports);
function disconnect(pool, debug9) {
  debug9 ??= (0, import_debug9.default)("ndk:relay:auth-policies:disconnect");
  return async (relay) => {
    debug9?.(`Relay ${relay.url} requested authentication, disconnecting`);
    pool.removeRelay(relay.url);
  };
}
async function signAndAuth(event, relay, signer, debug9, resolve, reject) {
  try {
    await event.sign(signer);
    resolve(event);
  } catch (e) {
    debug9?.(`Failed to publish auth event to relay ${relay.url}`, e);
    reject(event);
  }
}
function signIn({ ndk, signer, debug: debug9 } = {}) {
  debug9 ??= (0, import_debug9.default)("ndk:auth-policies:signIn");
  return async (relay, challenge3) => {
    debug9?.(`Relay ${relay.url} requested authentication, signing in`);
    const event = new NDKEvent(ndk);
    event.kind = 22242;
    event.tags = [
      ["relay", relay.url],
      ["challenge", challenge3]
    ];
    signer ??= ndk?.signer;
    return new Promise(async (resolve, reject) => {
      if (signer) {
        await signAndAuth(event, relay, signer, debug9, resolve, reject);
      } else {
        ndk?.once("signer:ready", async (signer2) => {
          await signAndAuth(event, relay, signer2, debug9, resolve, reject);
        });
      }
    });
  };
}
var NDKRelayAuthPolicies = {
  disconnect,
  signIn
};
async function ndkSignerFromPayload(payloadString, ndk) {
  let parsed;
  try {
    parsed = JSON.parse(payloadString);
  } catch (e) {
    console.error("Failed to parse signer payload string", payloadString, e);
    return void 0;
  }
  if (!parsed || typeof parsed.type !== "string") {
    console.error("Failed to parse signer payload string", payloadString, new Error("Missing type field"));
    return void 0;
  }
  const SignerClass = signerRegistry.get(parsed.type);
  if (!SignerClass) {
    throw new Error(`Unknown signer type: ${parsed.type}`);
  }
  try {
    return await SignerClass.fromPayload(payloadString, ndk);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to deserialize signer type ${parsed.type}: ${errorMsg}`);
  }
}
var NDKNip07Signer = class _NDKNip07Signer {
  _userPromise;
  encryptionQueue = [];
  encryptionProcessing = false;
  debug;
  waitTimeout;
  _pubkey;
  ndk;
  _user;
  /**
   * @param waitTimeout - The timeout in milliseconds to wait for the NIP-07 to become available
   */
  constructor(waitTimeout = 1e3, ndk) {
    this.debug = (0, import_debug10.default)("ndk:nip07");
    this.waitTimeout = waitTimeout;
    this.ndk = ndk;
  }
  get pubkey() {
    if (!this._pubkey) throw new Error("Not ready");
    return this._pubkey;
  }
  async blockUntilReady() {
    await this.waitForExtension();
    const pubkey = await window.nostr?.getPublicKey();
    if (!pubkey) {
      throw new Error("User rejected access");
    }
    this._pubkey = pubkey;
    let user;
    if (this.ndk) user = this.ndk.getUser({ pubkey });
    else user = new NDKUser({ pubkey });
    this._user = user;
    return user;
  }
  /**
   * Getter for the user property.
   * @returns The NDKUser instance.
   */
  async user() {
    if (!this._userPromise) {
      this._userPromise = this.blockUntilReady();
    }
    return this._userPromise;
  }
  get userSync() {
    if (!this._user) throw new Error("User not ready");
    return this._user;
  }
  /**
   * Signs the given Nostr event.
   * @param event - The Nostr event to be signed.
   * @returns The signature of the signed event.
   * @throws Error if the NIP-07 is not available on the window object.
   */
  async sign(event) {
    await this.waitForExtension();
    const signedEvent = await window.nostr?.signEvent(event);
    if (!signedEvent) throw new Error("Failed to sign event");
    return signedEvent.sig;
  }
  async relays(ndk) {
    await this.waitForExtension();
    const relays = await window.nostr?.getRelays?.() || {};
    const activeRelays = [];
    for (const url of Object.keys(relays)) {
      if (relays[url].read && relays[url].write) {
        activeRelays.push(url);
      }
    }
    return activeRelays.map((url) => new NDKRelay(url, ndk?.relayAuthDefaultPolicy, ndk));
  }
  async encryptionEnabled(nip) {
    const enabled = [];
    if ((!nip || nip === "nip04") && Boolean(window.nostr?.nip04)) enabled.push("nip04");
    if ((!nip || nip === "nip44") && Boolean(window.nostr?.nip44)) enabled.push("nip44");
    return enabled;
  }
  async encrypt(recipient, value, nip = "nip04") {
    if (!await this.encryptionEnabled(nip))
      throw new Error(`${nip}encryption is not available from your browser extension`);
    await this.waitForExtension();
    const recipientHexPubKey = recipient.pubkey;
    return this.queueEncryption(nip, "encrypt", recipientHexPubKey, value);
  }
  async decrypt(sender, value, nip = "nip04") {
    if (!await this.encryptionEnabled(nip))
      throw new Error(`${nip}encryption is not available from your browser extension`);
    await this.waitForExtension();
    const senderHexPubKey = sender.pubkey;
    return this.queueEncryption(nip, "decrypt", senderHexPubKey, value);
  }
  async queueEncryption(scheme, method, counterpartyHexpubkey, value) {
    return new Promise((resolve, reject) => {
      this.encryptionQueue.push({
        scheme,
        method,
        counterpartyHexpubkey,
        value,
        resolve,
        reject
      });
      if (!this.encryptionProcessing) {
        this.processEncryptionQueue();
      }
    });
  }
  async processEncryptionQueue(item, retries = 0) {
    if (!item && this.encryptionQueue.length === 0) {
      this.encryptionProcessing = false;
      return;
    }
    this.encryptionProcessing = true;
    const currentItem = item || this.encryptionQueue.shift();
    if (!currentItem) {
      this.encryptionProcessing = false;
      return;
    }
    const { scheme, method, counterpartyHexpubkey, value, resolve, reject } = currentItem;
    this.debug("Processing encryption queue item", {
      method,
      counterpartyHexpubkey,
      value
    });
    try {
      const result = await window.nostr?.[scheme]?.[method](counterpartyHexpubkey, value);
      if (!result) throw new Error("Failed to encrypt/decrypt");
      resolve(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("call already executing") && retries < 5) {
        this.debug("Retrying encryption queue item", {
          method,
          counterpartyHexpubkey,
          value,
          retries
        });
        setTimeout(() => {
          this.processEncryptionQueue(currentItem, retries + 1);
        }, 50 * retries);
        return;
      }
      reject(error instanceof Error ? error : new Error(errorMessage));
    }
    this.processEncryptionQueue();
  }
  waitForExtension() {
    return new Promise((resolve, reject) => {
      if (window.nostr) {
        resolve();
        return;
      }
      let timerId;
      const intervalId = setInterval(() => {
        if (window.nostr) {
          clearTimeout(timerId);
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
      timerId = setTimeout(() => {
        clearInterval(intervalId);
        reject(new Error("NIP-07 extension not available"));
      }, this.waitTimeout);
    });
  }
  /**
   * Serializes the signer type into a storable format.
   * NIP-07 signers don't have persistent state to serialize beyond their type.
   * @returns A JSON string containing the type.
   */
  toPayload() {
    const payload = {
      type: "nip07",
      payload: ""
      // No specific payload needed for NIP-07
    };
    return JSON.stringify(payload);
  }
  /**
   * Deserializes the signer from a payload string.
   * Creates a new NDKNip07Signer instance.
   * @param payloadString The JSON string obtained from toPayload().
   * @param ndk Optional NDK instance.
   * @returns An instance of NDKNip07Signer.
   */
  static async fromPayload(payloadString, ndk) {
    const payload = JSON.parse(payloadString);
    if (payload.type !== "nip07") {
      throw new Error(`Invalid payload type: expected 'nip07', got ${payload.type}`);
    }
    return new _NDKNip07Signer(void 0, ndk);
  }
};
registerSigner("nip07", NDKNip07Signer);
var NDKNostrRpc = class extends import_tseep7.EventEmitter {
  ndk;
  signer;
  relaySet;
  debug;
  encryptionType = "nip44";
  pool;
  constructor(ndk, signer, debug9, relayUrls) {
    super();
    this.ndk = ndk;
    this.signer = signer;
    if (relayUrls) {
      this.pool = new NDKPool(relayUrls, ndk, {
        debug: debug9.extend("rpc-pool"),
        name: "Nostr RPC"
      });
      this.relaySet = new NDKRelaySet(/* @__PURE__ */ new Set(), ndk, this.pool);
      for (const url of relayUrls) {
        const relay = this.pool.getRelay(url, false, false);
        relay.authPolicy = NDKRelayAuthPolicies.signIn({ ndk, signer, debug: debug9 });
        this.relaySet.addRelay(relay);
        relay.connect();
      }
    }
    this.debug = debug9.extend("rpc");
  }
  /**
   * Updates the relay set used for RPC communication.
   * Disconnects from old relays and connects to new ones.
   */
  updateRelays(relayUrls) {
    if (this.pool) {
      for (const relay of this.pool.relays.values()) {
        relay.disconnect();
      }
    }
    this.pool = new NDKPool(relayUrls, this.ndk, {
      debug: this.debug.extend("rpc-pool"),
      name: "Nostr RPC"
    });
    this.relaySet = new NDKRelaySet(/* @__PURE__ */ new Set(), this.ndk, this.pool);
    for (const url of relayUrls) {
      const relay = this.pool.getRelay(url, false, false);
      relay.authPolicy = NDKRelayAuthPolicies.signIn({
        ndk: this.ndk,
        signer: this.signer,
        debug: this.debug
      });
      this.relaySet.addRelay(relay);
      relay.connect();
    }
  }
  /**
   * Subscribe to a filter. This function will resolve once the subscription is ready.
   */
  subscribe(filter) {
    return new Promise((resolve) => {
      const sub = this.ndk.subscribe(filter, {
        closeOnEose: false,
        groupable: false,
        cacheUsage: "ONLY_RELAY",
        pool: this.pool,
        relaySet: this.relaySet,
        onEvent: async (event) => {
          try {
            const parsedEvent = await this.parseEvent(event);
            if (parsedEvent.method) {
              this.emit("request", parsedEvent);
            } else {
              this.emit(`response-${parsedEvent.id}`, parsedEvent);
              this.emit("response", parsedEvent);
            }
          } catch (e) {
            this.debug("error parsing event", e, event.rawEvent());
          }
        },
        onEose: () => {
          this.debug("eosed");
          resolve(sub);
        }
      });
    });
  }
  async parseEvent(event) {
    if (this.encryptionType === "nip44" && event.content.includes("?iv=")) {
      this.encryptionType = "nip04";
    } else if (this.encryptionType === "nip04" && !event.content.includes("?iv=")) {
      this.encryptionType = "nip44";
    }
    const remoteUser = this.ndk.getUser({ pubkey: event.pubkey });
    remoteUser.ndk = this.ndk;
    let decryptedContent;
    try {
      decryptedContent = await this.signer.decrypt(remoteUser, event.content, this.encryptionType);
    } catch (_e) {
      const otherEncryptionType = this.encryptionType === "nip04" ? "nip44" : "nip04";
      decryptedContent = await this.signer.decrypt(remoteUser, event.content, otherEncryptionType);
      this.encryptionType = otherEncryptionType;
    }
    const parsedContent = JSON.parse(decryptedContent);
    const { id, method, params, result, error } = parsedContent;
    if (method) {
      return { id, pubkey: event.pubkey, method, params, event };
    }
    return { id, result, error, event };
  }
  async sendResponse(id, remotePubkey, result, kind = 24133, error) {
    const res = { id, result };
    if (error) {
      res.error = error;
    }
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ pubkey: remotePubkey });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(res),
      tags: [["p", remotePubkey]],
      pubkey: localUser.pubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content, this.encryptionType);
    await event.sign(this.signer);
    await event.publish(this.relaySet);
  }
  /**
   * Sends a request.
   * @param remotePubkey
   * @param method
   * @param params
   * @param kind
   * @param id
   */
  async sendRequest(remotePubkey, method, params = [], kind = 24133, cb) {
    const id = Math.random().toString(36).substring(7);
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ pubkey: remotePubkey });
    const request = { id, method, params };
    const promise = new Promise(() => {
      const responseHandler = (response) => {
        if (response.result === "auth_url") {
          this.once(`response-${id}`, responseHandler);
          this.emit("authUrl", response.error);
        } else if (cb) {
          cb(response);
        }
      };
      this.once(`response-${id}`, responseHandler);
    });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(request),
      tags: [["p", remotePubkey]],
      pubkey: localUser.pubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content, this.encryptionType);
    await event.sign(this.signer);
    await event.publish(this.relaySet);
    return promise;
  }
};
var ConnectEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [_, token] = params;
    const debug9 = backend.debug.extend("connect");
    debug9(`connection request from ${remotePubkey}`);
    if (token && backend.applyToken) {
      debug9("applying token");
      await backend.applyToken(remotePubkey, token);
    }
    if (await backend.pubkeyAllowed({
      id,
      pubkey: remotePubkey,
      method: "connect",
      params: token
    })) {
      debug9(`connection request from ${remotePubkey} allowed`);
      return "ack";
    }
    debug9(`connection request from ${remotePubkey} rejected`);
    return void 0;
  }
};
var GetPublicKeyHandlingStrategy = class {
  async handle(backend, _id, _remotePubkey, _params) {
    return backend.localUser?.pubkey;
  }
};
var Nip04DecryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [senderPubkey, payload] = params;
    const senderUser = new NDKUser({ pubkey: senderPubkey });
    const decryptedPayload = await decrypt32(backend, id, remotePubkey, senderUser, payload);
    return decryptedPayload;
  }
};
async function decrypt32(backend, id, remotePubkey, senderUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip04_decrypt",
    params: payload
  })) {
    backend.debug(`decrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.decrypt(senderUser, payload, "nip04");
}
var Nip04EncryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [recipientPubkey, payload] = params;
    const recipientUser = new NDKUser({ pubkey: recipientPubkey });
    const encryptedPayload = await encrypt32(backend, id, remotePubkey, recipientUser, payload);
    return encryptedPayload;
  }
};
async function encrypt32(backend, id, remotePubkey, recipientUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip04_encrypt",
    params: payload
  })) {
    backend.debug(`encrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.encrypt(recipientUser, payload, "nip04");
}
var Nip44DecryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [senderPubkey, payload] = params;
    const senderUser = new NDKUser({ pubkey: senderPubkey });
    const decryptedPayload = await decrypt42(backend, id, remotePubkey, senderUser, payload);
    return decryptedPayload;
  }
};
async function decrypt42(backend, id, remotePubkey, senderUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip44_decrypt",
    params: payload
  })) {
    backend.debug(`decrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.decrypt(senderUser, payload, "nip44");
}
var Nip44EncryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [recipientPubkey, payload] = params;
    const recipientUser = new NDKUser({ pubkey: recipientPubkey });
    const encryptedPayload = await encrypt42(backend, id, remotePubkey, recipientUser, payload);
    return encryptedPayload;
  }
};
async function encrypt42(backend, id, remotePubkey, recipientUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip44_encrypt",
    params: payload
  })) {
    backend.debug(`encrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.encrypt(recipientUser, payload, "nip44");
}
var PingEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, _params) {
    const debug9 = backend.debug.extend("ping");
    debug9(`ping request from ${remotePubkey}`);
    if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "ping" })) {
      debug9(`connection request from ${remotePubkey} allowed`);
      return "pong";
    }
    debug9(`connection request from ${remotePubkey} rejected`);
    return void 0;
  }
};
var SignEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const event = await signEvent(backend, id, remotePubkey, params);
    if (!event) return void 0;
    return JSON.stringify(await event.toNostrEvent());
  }
};
async function signEvent(backend, id, remotePubkey, params) {
  const [eventString] = params;
  backend.debug(`sign event request from ${remotePubkey}`);
  const event = new NDKEvent(backend.ndk, JSON.parse(eventString));
  backend.debug("event to sign", event.rawEvent());
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "sign_event",
    params: event
  })) {
    backend.debug(`sign event request from ${remotePubkey} rejected`);
    return void 0;
  }
  backend.debug(`sign event request from ${remotePubkey} allowed`);
  await event.sign(backend.signer);
  return event;
}
var SwitchRelaysEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, _params) {
    const debug9 = backend.debug.extend("switch_relays");
    debug9(`switch_relays request from ${remotePubkey}`);
    if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "switch_relays" })) {
      debug9(`responding with relays: ${backend.relayUrls.join(", ")}`);
      return JSON.stringify(backend.relayUrls);
    }
    debug9(`switch_relays request from ${remotePubkey} rejected`);
    return void 0;
  }
};
var NDKNip46Backend = class {
  ndk;
  signer;
  localUser;
  debug;
  rpc;
  permitCallback;
  relayUrls;
  /**
   * @param ndk The NDK instance to use
   * @param privateKeyOrSigner The private key or signer of the npub that wants to be published as
   * @param permitCallback Callback executed when permission is requested
   */
  constructor(ndk, privateKeyOrSigner, permitCallback, relayUrls) {
    this.ndk = ndk;
    if (privateKeyOrSigner instanceof Uint8Array) {
      this.signer = new NDKPrivateKeySigner(privateKeyOrSigner);
    } else if (privateKeyOrSigner instanceof String) {
      this.signer = new NDKPrivateKeySigner(hexToBytes2(privateKeyOrSigner));
    } else if (privateKeyOrSigner instanceof NDKPrivateKeySigner) {
      this.signer = privateKeyOrSigner;
    } else {
      throw new Error("Invalid signer");
    }
    this.debug = ndk.debug.extend("nip46:backend");
    this.relayUrls = relayUrls ?? Array.from(ndk.pool.relays.keys());
    this.rpc = new NDKNostrRpc(ndk, this.signer, this.debug, this.relayUrls);
    this.permitCallback = permitCallback;
  }
  /**
   * This method starts the backend, which will start listening for incoming
   * requests.
   */
  async start() {
    this.localUser = await this.signer.user();
    this.ndk.subscribe(
      {
        kinds: [24133],
        "#p": [this.localUser.pubkey]
      },
      {
        closeOnEose: false,
        onEvent: (e) => this.handleIncomingEvent(e)
      }
    );
  }
  handlers = {
    connect: new ConnectEventHandlingStrategy(),
    sign_event: new SignEventHandlingStrategy(),
    nip04_encrypt: new Nip04EncryptHandlingStrategy(),
    nip04_decrypt: new Nip04DecryptHandlingStrategy(),
    nip44_encrypt: new Nip44EncryptHandlingStrategy(),
    nip44_decrypt: new Nip44DecryptHandlingStrategy(),
    get_public_key: new GetPublicKeyHandlingStrategy(),
    ping: new PingEventHandlingStrategy(),
    switch_relays: new SwitchRelaysEventHandlingStrategy()
  };
  /**
   * Enables the user to set a custom strategy for handling incoming events.
   * @param method - The method to set the strategy for
   * @param strategy - The strategy to set
   */
  setStrategy(method, strategy) {
    this.handlers[method] = strategy;
  }
  /**
   * Overload this method to apply tokens, which can
   * wrap permission sets to be applied to a pubkey.
   * @param pubkey public key to apply token to
   * @param token token to apply
   */
  async applyToken(_pubkey, _token) {
    throw new Error("connection token not supported");
  }
  async handleIncomingEvent(event) {
    const { id, method, params } = await this.rpc.parseEvent(event);
    const remotePubkey = event.pubkey;
    let response;
    let errorHandled = false;
    this.debug("incoming event", { id, method, params });
    if (!event.verifySignature(false)) {
      this.debug("invalid signature", event.rawEvent());
      return;
    }
    const strategy = this.handlers[method];
    if (strategy) {
      try {
        response = await strategy.handle(this, id, remotePubkey, params);
      } catch (e) {
        this.debug("error handling event", e, { id, method, params });
        errorHandled = true;
        try {
          await this.rpc.sendResponse(id, remotePubkey, "error", void 0, e.message);
        } catch (sendError) {
          this.debug("failed to send error response", sendError);
        }
      }
    } else {
      this.debug("unsupported method", { method, params });
    }
    if (!errorHandled) {
      try {
        if (response) {
          this.debug(`sending response to ${remotePubkey}`, response);
          await this.rpc.sendResponse(id, remotePubkey, response);
        } else {
          await this.rpc.sendResponse(id, remotePubkey, "error", void 0, "Not authorized");
        }
      } catch (sendError) {
        this.debug("failed to send response", sendError);
      }
    }
    if (method === "switch_relays" && response) {
      this.rpc.updateRelays(this.relayUrls);
    }
  }
  /**
   * This method should be overriden by the user to allow or reject incoming
   * connections.
   */
  async pubkeyAllowed(params) {
    return this.permitCallback(params);
  }
};
function nostrConnectGenerateSecret() {
  return Math.random().toString(36).substring(2, 15);
}
function generateNostrConnectUri(pubkey, secret, relay, options) {
  const meta = {
    name: options?.name ? encodeURIComponent(options.name) : "",
    url: options?.url ? encodeURIComponent(options.url) : "",
    image: options?.image ? encodeURIComponent(options.image) : "",
    perms: options?.perms ? encodeURIComponent(options.perms) : ""
  };
  let uri = `nostrconnect://${pubkey}?image=${meta.image}&url=${meta.url}&name=${meta.name}&perms=${meta.perms}&secret=${encodeURIComponent(secret)}`;
  if (relay) {
    uri += `&relay=${encodeURIComponent(relay)}`;
  }
  return uri;
}
var NDKNip46Signer = class _NDKNip46Signer extends import_tseep8.EventEmitter {
  ndk;
  _user;
  /**
   * The pubkey of the bunker that will be providing signatures
   */
  bunkerPubkey;
  /**
   * The pubkey of the user that events will be published as
   */
  userPubkey;
  get pubkey() {
    if (!this.userPubkey) throw new Error("Not ready");
    return this.userPubkey;
  }
  /**
   * An optional secret value provided to connect to the bunker
   */
  secret;
  localSigner;
  nip05;
  rpc;
  debug;
  relayUrls;
  subscription;
  /**
   * If using nostrconnect://, stores the nostrConnectURI
   */
  nostrConnectUri;
  /**
   * The random secret used for nostrconnect:// flows.
   */
  nostrConnectSecret;
  /**
   *
   * Don't instantiate this directly. Use the static methods instead.
   *
   * @example:
   * // for bunker:// flow
   * const signer = NDKNip46Signer.bunker(ndk, "bunker://<connection-token>")
   * const signer = NDKNip46Signer.bunker(ndk, "<your-nip05>"); // with nip05 flow
   * // for nostrconnect:// flow
   * const signer = NDKNip46Signer.nostrconnect(ndk, "wss://relay.example.com")
   *
   * @param ndk - The NDK instance to use
   * @param userOrConnectionToken - The public key, or a connection token, of the npub that wants to be published as
   * @param localSigner - The signer that will be used to request events to be signed
   */
  constructor(ndk, userOrConnectionToken, localSigner, relayUrls, nostrConnectOptions) {
    super();
    this.ndk = ndk;
    this.debug = ndk.debug.extend("nip46:signer");
    this.relayUrls = relayUrls;
    if (!localSigner) {
      this.localSigner = NDKPrivateKeySigner.generate();
    } else {
      if (typeof localSigner === "string") {
        this.localSigner = new NDKPrivateKeySigner(localSigner);
      } else {
        this.localSigner = localSigner;
      }
    }
    if (userOrConnectionToken === false) {
    } else if (!userOrConnectionToken) {
      this.nostrconnectFlowInit(nostrConnectOptions);
    } else if (userOrConnectionToken.startsWith("bunker://")) {
      this.bunkerFlowInit(userOrConnectionToken);
    } else {
      this.nip05Init(userOrConnectionToken);
    }
    this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
  }
  /**
   * Connnect with a bunker:// flow
   * @param ndk
   * @param userOrConnectionToken bunker:// connection string
   * @param localSigner If you have previously authenticated with this signer, you can restore the session by providing the previously authenticated key
   */
  static bunker(ndk, userOrConnectionToken, localSigner) {
    return new _NDKNip46Signer(ndk, userOrConnectionToken, localSigner);
  }
  /**
   * Connect with a nostrconnect:// flow
   * @param ndk
   * @param relay - Relay used to connect with the signer
   * @param localSigner If you have previously authenticated with this signer, you can restore the session by providing the previously authenticated key
   */
  static nostrconnect(ndk, relay, localSigner, nostrConnectOptions) {
    return new _NDKNip46Signer(ndk, void 0, localSigner, [relay], nostrConnectOptions);
  }
  nostrconnectFlowInit(nostrConnectOptions) {
    this.nostrConnectSecret = nostrConnectGenerateSecret();
    const pubkey = this.localSigner.pubkey;
    this.nostrConnectUri = generateNostrConnectUri(
      pubkey,
      this.nostrConnectSecret,
      this.relayUrls?.[0],
      nostrConnectOptions
    );
  }
  bunkerFlowInit(connectionToken) {
    const bunkerUrl = new URL(connectionToken);
    const bunkerPubkey = bunkerUrl.hostname || bunkerUrl.pathname.replace(/^\/\//, "");
    const userPubkey = bunkerUrl.searchParams.get("pubkey");
    const relayUrls = bunkerUrl.searchParams.getAll("relay");
    const secret = bunkerUrl.searchParams.get("secret");
    this.bunkerPubkey = bunkerPubkey;
    this.userPubkey = userPubkey;
    this.relayUrls = relayUrls;
    this.secret = secret;
  }
  nip05Init(nip05) {
    this.nip05 = nip05;
  }
  /**
   * We start listening for events from the bunker
   */
  async startListening() {
    if (this.subscription) return;
    const localUser = await this.localSigner.user();
    if (!localUser) throw new Error("Local signer not ready");
    this.subscription = await this.rpc.subscribe({
      kinds: [
        24133
        /* NostrConnect */
      ],
      "#p": [localUser.pubkey]
    });
  }
  /**
   * Get the user that is being published as
   */
  async user() {
    if (this._user) return this._user;
    return this.blockUntilReady();
  }
  get userSync() {
    if (!this._user) throw new Error("Remote user not ready synchronously");
    return this._user;
  }
  async blockUntilReadyNostrConnect() {
    return new Promise((resolve, reject) => {
      const connect = (response) => {
        if (response.result === this.nostrConnectSecret) {
          this.bunkerPubkey = response.event.pubkey;
          this.rpc.off("response", connect);
          this.getPublicKey().then(async (pubkey) => {
            this.userPubkey = pubkey;
            this._user = this.ndk.getUser({ pubkey });
            await this.switchRelays();
            resolve(this._user);
          }).catch(reject);
        }
      };
      this.startListening();
      this.rpc.on("response", connect);
    });
  }
  async blockUntilReady() {
    if (!this.bunkerPubkey && !this.nostrConnectSecret && !this.nip05) {
      throw new Error("Bunker pubkey not set");
    }
    if (this.nostrConnectSecret) return this.blockUntilReadyNostrConnect();
    if (this.nip05 && !this.userPubkey) {
      const user = await NDKUser.fromNip05(this.nip05, this.ndk);
      if (user) {
        this._user = user;
        this.userPubkey = user.pubkey;
        this.relayUrls = user.nip46Urls;
        this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
      }
    }
    if (!this.bunkerPubkey && this.userPubkey) {
      this.bunkerPubkey = this.userPubkey;
    } else if (!this.bunkerPubkey) {
      throw new Error("Bunker pubkey not set");
    }
    await this.startListening();
    this.rpc.on("authUrl", (...props) => {
      this.emit("authUrl", ...props);
    });
    return new Promise((resolve, reject) => {
      const connectParams = [this.userPubkey ?? ""];
      if (this.secret) connectParams.push(this.secret);
      if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "connect", connectParams, 24133, (response) => {
        if (response.result === "ack") {
          this.getPublicKey().then(async (pubkey) => {
            this.userPubkey = pubkey;
            this._user = this.ndk.getUser({ pubkey });
            await this.switchRelays();
            resolve(this._user);
          });
        } else {
          reject(response.error);
        }
      });
    });
  }
  /**
   * Sends a switch_relays request to the bunker.
   * If the bunker responds with new relay URLs, updates the RPC layer
   * and resubscribes on the new relays.
   */
  async switchRelays() {
    if (!this.bunkerPubkey) return;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.debug("switch_relays timed out, bunker may not support it");
        resolve();
      }, 5e3);
      this.rpc.sendRequest(this.bunkerPubkey, "switch_relays", [], 24133, async (response) => {
        clearTimeout(timeout);
        if (response.error || !response.result || response.result === "null") {
          this.debug("switch_relays: no relay change needed");
          resolve();
          return;
        }
        try {
          const newRelays = JSON.parse(response.result);
          if (Array.isArray(newRelays) && newRelays.length > 0) {
            this.debug("switching relays to %o", newRelays);
            this.relayUrls = newRelays;
            this.rpc.updateRelays(newRelays);
            this.subscription?.stop();
            this.subscription = void 0;
            await this.startListening();
          }
        } catch (e) {
          this.debug("error parsing switch_relays response", e);
        }
        resolve();
      });
    });
  }
  stop() {
    this.subscription?.stop();
    this.subscription = void 0;
  }
  async getPublicKey() {
    if (this.userPubkey) return this.userPubkey;
    return new Promise((resolve, _reject) => {
      if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "get_public_key", [], 24133, (response) => {
        resolve(response.result);
      });
    });
  }
  async encryptionEnabled(scheme) {
    if (scheme) return [scheme];
    return Promise.resolve(["nip04", "nip44"]);
  }
  async encrypt(recipient, value, scheme = "nip04") {
    return this.encryption(recipient, value, scheme, "encrypt");
  }
  async decrypt(sender, value, scheme = "nip04") {
    return this.encryption(sender, value, scheme, "decrypt");
  }
  async encryption(peer, value, scheme, method) {
    const promise = new Promise((resolve, reject) => {
      if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(
        this.bunkerPubkey,
        `${scheme}_${method}`,
        [peer.pubkey, value],
        24133,
        (response) => {
          if (!response.error) {
            resolve(response.result);
          } else {
            reject(response.error);
          }
        }
      );
    });
    return promise;
  }
  async sign(event) {
    const promise = new Promise((resolve, reject) => {
      if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(
        this.bunkerPubkey,
        "sign_event",
        [JSON.stringify(event)],
        24133,
        (response) => {
          if (!response.error) {
            const json = JSON.parse(response.result);
            resolve(json.sig);
          } else {
            reject(response.error);
          }
        }
      );
    });
    return promise;
  }
  /**
   * Allows creating a new account on the remote server.
   * @param username Desired username for the NIP-05
   * @param domain Desired domain for the NIP-05
   * @param email Email address to associate with this account -- Remote servers may use this for recovery
   * @returns The public key of the newly created account
   */
  async createAccount(username, domain, email) {
    await this.startListening();
    const req = [];
    if (username) req.push(username);
    if (domain) req.push(domain);
    if (email) req.push(email);
    return new Promise((resolve, reject) => {
      if (!this.bunkerPubkey) throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(
        this.bunkerPubkey,
        "create_account",
        req,
        24133,
        (response) => {
          if (!response.error) {
            const pubkey = response.result;
            resolve(pubkey);
          } else {
            reject(response.error);
          }
        }
      );
    });
  }
  /**
   * Serializes the signer's connection details and local signer state.
   * @returns A JSON string containing the type, connection info, and local signer payload.
   */
  toPayload() {
    if (!this.bunkerPubkey || !this.userPubkey) {
      throw new Error("NIP-46 signer is not fully initialized for serialization");
    }
    const payload = {
      type: "nip46",
      payload: {
        bunkerPubkey: this.bunkerPubkey,
        userPubkey: this.userPubkey,
        relayUrls: this.relayUrls,
        secret: this.secret,
        localSignerPayload: this.localSigner.toPayload(),
        // Store nip05 if it was used for initialization, otherwise null
        nip05: this.nip05 || null
      }
    };
    return JSON.stringify(payload);
  }
  /**
   * Deserializes the signer from a payload string.
   * @param payloadString The JSON string obtained from toPayload().
   * @param ndk The NDK instance, required for NIP-46.
   * @returns An instance of NDKNip46Signer.
   */
  static async fromPayload(payloadString, ndk) {
    if (!ndk) {
      throw new Error("NDK instance is required to deserialize NIP-46 signer");
    }
    const parsed = JSON.parse(payloadString);
    if (parsed.type !== "nip46") {
      throw new Error(`Invalid payload type: expected 'nip46', got ${parsed.type}`);
    }
    const payload = parsed.payload;
    if (!payload || typeof payload !== "object" || !payload.localSignerPayload) {
      throw new Error("Invalid payload content for nip46 signer");
    }
    const localSigner = await ndkSignerFromPayload(payload.localSignerPayload, ndk);
    if (!localSigner) {
      throw new Error("Failed to deserialize local signer for NIP-46");
    }
    if (!(localSigner instanceof NDKPrivateKeySigner)) {
      throw new Error("Local signer must be an instance of NDKPrivateKeySigner");
    }
    let signer;
    signer = new _NDKNip46Signer(ndk, false, localSigner, payload.relayUrls);
    signer.userPubkey = payload.userPubkey;
    signer.bunkerPubkey = payload.bunkerPubkey;
    signer.relayUrls = payload.relayUrls;
    signer.secret = payload.secret;
    if (payload.userPubkey) {
      signer._user = new NDKUser({ pubkey: payload.userPubkey });
      if (signer._user) signer._user.ndk = ndk;
    }
    return signer;
  }
};
registerSigner("nip46", NDKNip46Signer);
async function pinEvent(user, event, pinEvent2, publish) {
  const kind = 10001;
  if (!user.ndk) throw new Error("No NDK instance found");
  user.ndk.assertSigner();
  if (!pinEvent2) {
    const events = await user.ndk.fetchEvents(
      { kinds: [kind], authors: [user.pubkey] },
      {
        cacheUsage: "ONLY_RELAY"
        /* ONLY_RELAY */
      }
    );
    if (events.size > 0) {
      pinEvent2 = lists_default.from(Array.from(events)[0]);
    } else {
      pinEvent2 = new NDKEvent(user.ndk, {
        kind
      });
    }
  }
  pinEvent2.tag(event);
  if (publish) {
    await pinEvent2.publish();
  }
  return pinEvent2;
}
function matchFilter2(filter, event) {
  if (filter.ids && filter.ids.indexOf(event.id) === -1) {
    return false;
  }
  if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
    return false;
  }
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
    return false;
  }
  for (const f of Object.keys(filter)) {
    if (f[0] === "#") {
      const tagName = f.slice(1);
      if (tagName === "t") {
        const values = filter[`#${tagName}`]?.map((v) => v.toLowerCase());
        if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v.toLowerCase()) !== -1))
          return false;
      } else {
        const values = filter[`#${tagName}`];
        if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v) !== -1)) return false;
      }
    }
  }
  if (filter.since && event.created_at < filter.since) return false;
  if (filter.until && event.created_at > filter.until) return false;
  return true;
}
var d2 = (0, import_debug12.default)("ndk:zapper:ln");
async function getNip57ZapSpecFromLud({ lud06, lud16 }, ndk) {
  let zapEndpoint;
  if (lud16 && !lud16.startsWith("LNURL")) {
    const [name, domain] = lud16.split("@");
    zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
  } else if (lud06) {
    const { words } = bech322.decode(lud06, 1e3);
    const data = bech322.fromWords(words);
    const utf8Decoder3 = new TextDecoder("utf-8");
    zapEndpoint = utf8Decoder3.decode(data);
  }
  if (!zapEndpoint) {
    d2("No zap endpoint found %o", { lud06, lud16 });
    throw new Error("No zap endpoint found");
  }
  try {
    const _fetch5 = ndk.httpFetch || fetch;
    const response = await _fetch5(zapEndpoint);
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
    }
    return await response.json();
  } catch (e) {
    throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${e}`);
  }
}
async function generateZapRequest(target, ndk, data, pubkey, amount, relays, comment, tags, signer) {
  const zapEndpoint = data.callback;
  const event = new NDKEvent(ndk);
  event.kind = 9734;
  event.content = comment || "";
  event.tags = [
    ["relays", ...relays.slice(0, 4)],
    ["amount", amount.toString()],
    ["lnurl", zapEndpoint],
    ["p", pubkey]
  ];
  if (target instanceof NDKEvent) {
    const referenceTags = target.referenceTags();
    const nonPTags = referenceTags.filter((tag) => tag[0] !== "p");
    event.tags.push(...nonPTags);
    if (target.kind !== void 0) {
      event.tags.push(["k", target.kind.toString()]);
    }
  }
  if (tags) {
    event.tags = event.tags.concat(tags);
  }
  const eTaggedEvents = /* @__PURE__ */ new Set();
  const aTaggedEvents = /* @__PURE__ */ new Set();
  for (const tag of event.tags) {
    if (tag[0] === "e") {
      eTaggedEvents.add(tag[1]);
    } else if (tag[0] === "a") {
      aTaggedEvents.add(tag[1]);
    }
  }
  if (eTaggedEvents.size > 1) throw new Error("Only one e-tag is allowed");
  if (aTaggedEvents.size > 1) throw new Error("Only one a-tag is allowed");
  event.tags = event.tags.filter((tag) => tag[0] !== "p");
  event.tags.push(["p", pubkey]);
  await event.sign(signer);
  return event;
}
var d3 = (0, import_debug11.default)("ndk:zapper");
var NDKZapper = class extends import_tseep9.EventEmitter {
  target;
  ndk;
  comment;
  amount;
  unit;
  tags;
  signer;
  zapMethod;
  nutzapAsFallback;
  lnPay;
  /**
   * Called when a cashu payment is to be made.
   * This function should swap/mint proofs for the required amount, in the required unit,
   * in any of the provided mints and return the proofs and mint used.
   */
  cashuPay;
  onComplete;
  maxRelays = 3;
  /**
   *
   * @param target The target of the zap
   * @param amount The amount to send indicated in the unit
   * @param unit The unit of the amount
   * @param opts Options for the zap
   */
  constructor(target, amount, unit = "msat", opts = {}) {
    super();
    this.target = target;
    this.ndk = opts.ndk || target.ndk;
    if (!this.ndk) {
      throw new Error("No NDK instance provided");
    }
    this.amount = amount;
    this.comment = opts.comment;
    this.unit = unit;
    this.tags = opts.tags;
    this.signer = opts.signer;
    this.nutzapAsFallback = opts.nutzapAsFallback ?? false;
    this.lnPay = opts.lnPay || this.ndk.walletConfig?.lnPay;
    this.cashuPay = opts.cashuPay || this.ndk.walletConfig?.cashuPay;
    this.onComplete = opts.onComplete || this.ndk.walletConfig?.onPaymentComplete;
  }
  /**
   * Initiate zapping process
   *
   * This function will calculate the splits for this zap and initiate each zap split.
   */
  async zap(methods) {
    d3("Starting zap process", {
      target: this.target,
      amount: this.amount,
      unit: this.unit,
      methods,
      nutzapAsFallback: this.nutzapAsFallback
    });
    const splits = this.getZapSplits();
    d3("Calculated zap splits", splits);
    const results = /* @__PURE__ */ new Map();
    await Promise.all(
      splits.map(async (split) => {
        let result;
        d3("Processing split", split);
        try {
          result = await this.zapSplit(split, methods);
          d3("Split completed successfully", { split, result });
        } catch (e) {
          d3("Split failed", { split, error: e.message });
          result = new Error(e.message);
        }
        this.emit("split:complete", split, result);
        results.set(split, result);
      })
    );
    d3("All splits completed", results);
    const allFailed = Array.from(results.values()).every(
      (result) => result === void 0 || result instanceof Error
    );
    const anyFailed = Array.from(results.values()).some((result) => result instanceof Error);
    this.emit("complete", results);
    if (this.onComplete) this.onComplete(results);
    if (allFailed) {
      const errors = Array.from(results.values()).filter((r) => r instanceof Error).map((e) => e.message).join(", ");
      const errorMessage = errors || "All zap attempts failed";
      d3("All splits failed", errorMessage);
      throw new Error(errorMessage);
    }
    if (anyFailed) {
      d3("Some splits failed, but at least one succeeded");
    }
    return results;
  }
  async zapNip57(split, data) {
    if (!this.lnPay) throw new Error("No lnPay function available");
    const zapSpec = await getNip57ZapSpecFromLud(data, this.ndk);
    if (!zapSpec) throw new Error("No zap spec available for recipient");
    const relays = await this.relays(split.pubkey);
    const zapRequest = await generateZapRequest(
      this.target,
      this.ndk,
      zapSpec,
      split.pubkey,
      split.amount,
      relays,
      this.comment,
      this.tags,
      this.signer
    );
    if (!zapRequest) {
      d3("Unable to generate zap request");
      throw new Error("Unable to generate zap request");
    }
    const pr = await this.getLnInvoice(zapRequest, split.amount, zapSpec);
    if (!pr) {
      d3("Unable to get payment request");
      throw new Error("Unable to get payment request");
    }
    this.emit("ln_invoice", {
      amount: split.amount,
      recipientPubkey: split.pubkey,
      unit: this.unit,
      nip57ZapRequest: zapRequest,
      pr,
      type: "nip57"
    });
    const res = await this.lnPay({
      target: this.target,
      recipientPubkey: split.pubkey,
      paymentDescription: "NIP-57 Zap",
      pr,
      amount: split.amount,
      unit: this.unit,
      nip57ZapRequest: zapRequest
    });
    if (res?.preimage) {
      this.emit("ln_payment", {
        preimage: res.preimage,
        amount: split.amount,
        recipientPubkey: split.pubkey,
        pr,
        unit: this.unit,
        nip57ZapRequest: zapRequest,
        type: "nip57"
      });
    }
    return res;
  }
  /**
   * Fetches information about a NIP-61 zap and asks the caller to create cashu proofs for the zap.
   *
   * (note that the cashuPay function can use any method to create the proofs, including using lightning
   * to mint proofs in the specified mint, the responsibility of minting the proofs is delegated to the caller (e.g. ndk-wallet))
   */
  async zapNip61(split, data) {
    d3("Starting NIP-61 zap", { split, data });
    if (!this.cashuPay) {
      d3("No cashuPay function available");
      throw new Error("No cashuPay function available");
    }
    const proofTags = [];
    if (this.target instanceof NDKEvent) {
      proofTags.push(["e", this.target.id]);
    }
    const signer = this.signer || this.ndk.signer;
    if (signer) {
      const user = await signer.user();
      proofTags.push(["P", user.pubkey]);
    }
    d3("Calling cashuPay function", {
      target: this.target,
      recipientPubkey: split.pubkey,
      amount: split.amount,
      unit: this.unit,
      proofTags,
      data
    });
    let ret;
    ret = await this.cashuPay(
      {
        target: this.target,
        recipientPubkey: split.pubkey,
        paymentDescription: "NIP-61 Zap",
        amount: split.amount,
        unit: this.unit,
        proofTags,
        ...data ?? {}
      },
      (pr) => {
        d3("LN invoice generated for NIP-61", pr);
        this.emit("ln_invoice", {
          pr,
          amount: split.amount,
          recipientPubkey: split.pubkey,
          unit: this.unit,
          type: "nip61"
        });
      }
    );
    d3("NIP-61 Zap result: %o", ret);
    if (ret instanceof Error) {
      d3("cashuPay returned error", ret);
      return ret;
    }
    if (ret) {
      const { proofs, mint } = ret;
      if (!proofs || !mint) {
        d3("Invalid zap confirmation: missing proofs or mint", ret);
        throw new Error(`Invalid zap confirmation: missing proofs or mint: ${ret}`);
      }
      d3("Creating nutzap event", { proofsCount: proofs.length, mint });
      const relays = await this.relays(split.pubkey);
      d3("Publishing to relays", relays);
      const relaySet = NDKRelaySet.fromRelayUrls(relays, this.ndk);
      const nutzap = new NDKNutzap(this.ndk);
      nutzap.tags = [...nutzap.tags, ...this.tags || []];
      nutzap.proofs = proofs;
      nutzap.mint = mint;
      nutzap.target = this.target;
      nutzap.comment = this.comment;
      nutzap.unit = "sat";
      nutzap.recipientPubkey = split.pubkey;
      await nutzap.sign(this.signer);
      d3("Nutzap signed, publishing", nutzap.id);
      nutzap.publish(relaySet);
      return nutzap;
    }
    d3("cashuPay returned undefined");
  }
  /**
   * Get the zap methods available for the recipient and initiates the zap
   * in the desired method.
   * @param split
   * @param methods - The methods to try, if not provided, all methods will be tried.
   * @returns
   */
  async zapSplit(split, methods) {
    d3("Starting zapSplit", { split, methods });
    const recipient = this.ndk.getUser({ pubkey: split.pubkey });
    d3("Fetching zap info for recipient", recipient.pubkey);
    const zapMethods = await recipient.getZapInfo(2500);
    d3("Recipient zap methods", {
      methods: Array.from(zapMethods.keys()),
      nip61Data: zapMethods.get("nip61"),
      nip57Data: zapMethods.get("nip57")
    });
    let retVal;
    const canFallbackToNip61 = this.nutzapAsFallback && this.cashuPay;
    d3("Fallback configuration", {
      canFallbackToNip61,
      nutzapAsFallback: this.nutzapAsFallback,
      hasCashuPay: !!this.cashuPay
    });
    if (zapMethods.size === 0 && !canFallbackToNip61) {
      d3("No zap methods available and fallback disabled");
      throw new Error("No zap method available for recipient and NIP-61 fallback is disabled");
    }
    const nip61Fallback = async () => {
      d3("Executing NIP-61 fallback");
      if (!this.nutzapAsFallback) return;
      const relayLists = await getRelayListForUsers([split.pubkey], this.ndk);
      let relayUrls = relayLists.get(split.pubkey)?.readRelayUrls;
      relayUrls = this.ndk.pool.connectedRelays().map((r) => r.url);
      d3("NIP-61 fallback relay URLs", relayUrls);
      return await this.zapNip61(split, {
        // use the user's relay list
        relays: relayUrls,
        // lock to the user's actual pubkey
        p2pk: split.pubkey,
        // allow intramint fallback
        allowIntramintFallback: !!canFallbackToNip61
      });
    };
    const canUseNip61 = !methods || methods.includes("nip61");
    const canUseNip57 = !methods || methods.includes("nip57");
    d3("Method filters", { canUseNip61, canUseNip57 });
    const nip61Method = zapMethods.get("nip61");
    if (nip61Method && canUseNip61) {
      d3("Attempting NIP-61 zap", nip61Method);
      try {
        retVal = await this.zapNip61(split, nip61Method);
        if (retVal instanceof NDKNutzap) {
          d3("NIP-61 zap succeeded", retVal);
          return retVal;
        }
      } catch (e) {
        d3("NIP-61 attempt failed", e);
        this.emit("notice", `NIP-61 attempt failed: ${e.message}`);
      }
    }
    const nip57Method = zapMethods.get("nip57");
    if (nip57Method && canUseNip57) {
      d3("Attempting NIP-57 zap", nip57Method);
      try {
        retVal = await this.zapNip57(split, nip57Method);
        if (!(retVal instanceof Error)) {
          d3("NIP-57 zap succeeded", retVal);
          return retVal;
        }
      } catch (e) {
        d3("NIP-57 attempt failed", e);
        this.emit("notice", `NIP-57 attempt failed: ${e.message}`);
      }
    }
    if (canFallbackToNip61) {
      d3("Attempting NIP-61 fallback");
      retVal = await nip61Fallback();
      if (retVal instanceof Error) {
        d3("NIP-61 fallback failed", retVal);
        throw retVal;
      }
      d3("NIP-61 fallback succeeded", retVal);
      return retVal;
    }
    d3("All zap methods exhausted");
    this.emit("notice", "Zap methods exhausted and there was no fallback to NIP-61");
    if (retVal instanceof Error) throw retVal;
    return retVal;
  }
  /**
   * Gets a bolt11 for a nip57 zap
   * @param event
   * @param amount
   * @param zapEndpoint
   * @returns
   */
  async getLnInvoice(zapRequest, amount, data) {
    const zapEndpoint = data.callback;
    const eventPayload = JSON.stringify(zapRequest.rawEvent());
    d3(
      `Fetching invoice from ${zapEndpoint}?${new URLSearchParams({
        amount: amount.toString(),
        nostr: eventPayload
      })}`
    );
    const url = new URL(zapEndpoint);
    url.searchParams.append("amount", amount.toString());
    url.searchParams.append("nostr", eventPayload);
    d3(`Fetching invoice from ${url.toString()}`);
    const response = await fetch(url.toString());
    d3(`Got response from zap endpoint: ${zapEndpoint}`, { status: response.status });
    if (response.status !== 200) {
      d3(`Received non-200 status from zap endpoint: ${zapEndpoint}`, {
        status: response.status,
        amount,
        nostr: eventPayload
      });
      const text = await response.text();
      throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
    }
    const body = await response.json();
    return body.pr;
  }
  getZapSplits() {
    if (this.target instanceof NDKUser) {
      return [
        {
          pubkey: this.target.pubkey,
          amount: this.amount
        }
      ];
    }
    const zapTags = this.target.getMatchingTags("zap");
    if (zapTags.length === 0) {
      return [
        {
          pubkey: this.target.pubkey,
          amount: this.amount
        }
      ];
    }
    const splits = [];
    const total = zapTags.reduce((acc, tag) => acc + Number.parseInt(tag[2]), 0);
    for (const tag of zapTags) {
      const pubkey = tag[1];
      const amount = Math.floor(Number.parseInt(tag[2]) / total * this.amount);
      splits.push({ pubkey, amount });
    }
    return splits;
  }
  /**
   * Get the zap methods available for all recipients (all splits)
   * Returns a map of pubkey -> zap methods for that recipient
   *
   * @example
   * ```ts
   * const zapper = new NDKZapper(event, 1000, "msat");
   * const methods = await zapper.getRecipientZapMethods();
   * for (const [pubkey, zapMethods] of methods) {
   *   console.log(`${pubkey} accepts:`, Array.from(zapMethods.keys()));
   * }
   * ```
   */
  async getRecipientZapMethods(timeout = 2500) {
    const splits = this.getZapSplits();
    const results = /* @__PURE__ */ new Map();
    await Promise.all(
      splits.map(async (split) => {
        const user = this.ndk.getUser({ pubkey: split.pubkey });
        const zapMethods = await user.getZapInfo(timeout);
        results.set(split.pubkey, zapMethods);
      })
    );
    return results;
  }
  /**
   * Gets the zap method that should be used to zap a pubbkey
   * @param ndk
   * @param pubkey
   * @returns
   */
  async getZapMethods(ndk, recipient, timeout = 2500) {
    const user = ndk.getUser({ pubkey: recipient });
    return await user.getZapInfo(timeout);
  }
  /**
   * @returns the relays to use for the zap request
   */
  async relays(pubkey) {
    let r = [];
    if (this.ndk?.activeUser) {
      const relayLists = await getRelayListForUsers([this.ndk.activeUser.pubkey, pubkey], this.ndk);
      const relayScores = /* @__PURE__ */ new Map();
      for (const relayList of relayLists.values()) {
        for (const url of relayList.readRelayUrls) {
          const score = relayScores.get(url) || 0;
          relayScores.set(url, score + 1);
        }
      }
      r = Array.from(relayScores.entries()).sort((a, b) => b[1] - a[1]).map(([url]) => url).slice(0, this.maxRelays);
    }
    if (this.ndk?.pool?.permanentAndConnectedRelays().length) {
      r = this.ndk.pool.permanentAndConnectedRelays().map((relay) => relay.url);
    }
    if (!r.length) {
      r = [];
    }
    return r;
  }
};
export {
  BECH32_REGEX3 as BECH32_REGEX,
  HLL_REGISTER_COUNT,
  NDKAppHandlerEvent,
  NDKAppSettings,
  NDKArticle,
  NDKBlossomList,
  NDKCashuMintAnnouncement,
  NDKCashuMintList,
  NDKCashuToken,
  NDKCashuWalletTx,
  NDKClassified,
  NDKCountHll,
  NDKDVMJobFeedback,
  NDKDVMJobResult,
  NDKDVMRequest,
  NDKDraft,
  NDKDvmJobFeedbackStatus,
  NDKEvent,
  NDKFedimintMint,
  NDKFilterValidationMode,
  NDKFollowPack,
  NDKHighlight,
  NDKImage,
  NDKInterestList,
  NDKKind,
  NDKList,
  NDKListKinds,
  NDKMintRecommendation,
  NDKNip07Signer,
  NDKNip46Backend,
  NDKNip46Signer,
  NDKNostrRpc,
  NDKNutzap,
  NDKPool,
  NDKPrivateKeySigner,
  NDKProject,
  NDKProjectTemplate,
  NDKPublishError,
  NDKRelay,
  NDKRelayAuthPolicies,
  NDKRelayFeedList,
  NDKRelayList,
  NDKRelaySet,
  NDKRelayStatus,
  NDKRepost,
  NDKSimpleGroup,
  NDKSimpleGroupMemberList,
  NDKSimpleGroupMetadata,
  NDKStory,
  NDKStorySticker,
  NDKStoryStickerType,
  NDKSubscription,
  NDKSubscriptionCacheUsage,
  NDKSubscriptionReceipt,
  NDKSubscriptionStart,
  NDKSubscriptionTier,
  NDKTask,
  NDKThread,
  NDKTranscriptionDVM,
  NDKUser,
  NDKVideo,
  NDKVoiceMessage,
  NDKVoiceReply,
  NDKWiki,
  NDKWikiMergeRequest,
  NDKZap,
  NDKZapper,
  NIP33_A_REGEX,
  NdkNutzapStatus,
  NutzapValidationCode,
  NutzapValidationSeverity,
  SignatureVerificationStats,
  assertSignedEvent,
  calculateRelaySetFromEvent,
  calculateTermDurationInSeconds,
  cashuPubkeyToNostrPubkey,
  compareFilter,
  createSignedEvent,
  createValidationIssue,
  NDK as default,
  defaultOpts,
  deserialize,
  dvmSchedule,
  eventHasETagMarkers,
  eventIsPartOfThread,
  eventIsReply,
  eventReplies,
  eventThreadIds,
  eventThreads,
  eventsBySameAuthor,
  fetchRelayInformation2 as fetchRelayInformation,
  filterAndRelaySetFromBech32,
  filterEphemeralKindsFromFilter,
  filterFingerprint,
  filterForCache,
  filterForEventsTaggingId,
  filterFromId,
  generateContentTags,
  generateHashtags,
  generateSubId,
  generateZapRequest,
  getEventReplyId,
  getNip57ZapSpecFromLud,
  getRegisteredEventClasses,
  getRelayListForUser,
  getRelayListForUsers,
  getReplyTag,
  getRootEventId,
  getRootTag,
  giftUnwrap,
  giftWrap,
  imetaTagToTag,
  isEphemeralKind2 as isEphemeralKind,
  isEventOriginalPost,
  isNip33AValue,
  isSignedEvent,
  isUnsignedEvent,
  isValidEventId,
  isValidHex64,
  isValidNip05,
  isValidPubkey,
  mapImetaTag,
  matchFilter2 as matchFilter,
  mergeFilters,
  mergeTags,
  ndkSignerFromPayload,
  newAmount,
  nip19_exports3 as nip19,
  nip49_exports2 as nip49,
  normalize,
  normalizeRelayUrl,
  normalizeUrl,
  parseTagToSubscriptionAmount,
  pinEvent,
  possibleIntervalFrequencies,
  processFilters,
  profileFromEvent,
  proofP2pk,
  proofP2pkNostr,
  proofsTotalBalance,
  queryFullyFilled,
  registerEventClass,
  registerSigner,
  relayListFromKind3,
  relaysFromBech32,
  serialize,
  serializeProfile,
  startSignatureVerificationStats,
  strToDimension,
  strToPosition,
  tryNormalizeRelayUrl,
  uniqueTag,
  unregisterEventClass,
  wrapEvent3 as wrapEvent,
  zapInvoiceFromEvent
};
/*! Bundled license information:

@scure/base/lib/index.js:
@scure/base/index.js:
@scure/base/lib/esm/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/hashes/utils.js:
@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/secp256k1.js:
@noble/curves/esm/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
*/
