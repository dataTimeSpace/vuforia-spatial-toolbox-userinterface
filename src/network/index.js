/**
 *
 *
 *                                      .,,,;;,'''..
 *                                  .'','...     ..',,,.
 *                                .,,,,,,',,',;;:;,.  .,l,
 *                               .,',.     ...     ,;,   :l.
 *                              ':;.    .'.:do;;.    .c   ol;'.
 *       ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *      ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *     .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *      .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *     .:;,,::co0XOko'              ....''..'.'''''''.
 *     .dxk0KKdc:cdOXKl............. .. ..,c....
 *      .',lxOOxl:'':xkl,',......'....    ,'.
 *           .';:oo:...                        .
 *                .cd,      ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐    .
 *                  .l;     ║╣  │││ │ │ │├┬┘    '
 *                    'l.   ╚═╝─┴┘┴ ┴ └─┘┴└─   '.
 *                     .o.                   ...
 *                      .''''','.;:''.........
 *                           .'  .l
 *                          .:.   l'
 *                         .:.    .l.
 *                        .x:      :k;,.
 *                        cxlc;    cdc,,;;.
 *                       'l :..   .c  ,
 *                       o.
 *                      .,
 *
 *      ╦═╗┌─┐┌─┐┬  ┬┌┬┐┬ ┬  ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐  ╔═╗┬─┐┌─┐ ┬┌─┐┌─┐┌┬┐
 *      ╠╦╝├┤ ├─┤│  │ │ └┬┘  ║╣  │││ │ │ │├┬┘  ╠═╝├┬┘│ │ │├┤ │   │
 *      ╩╚═└─┘┴ ┴┴─┘┴ ┴  ┴   ╚═╝─┴┘┴ ┴ └─┘┴└─  ╩  ┴└─└─┘└┘└─┘└─┘ ┴
 *
 *
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Valentin Heun
 * Modified by Valentin Heun 2014, 2015, 2016, 2017
 * Modified by Benjamin Reynholds 2016, 2017
 * Modified by James Hobin 2016, 2017
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

createNameSpace('realityEditor.network');

realityEditor.network.state = {
    proxyProtocol: null,
    proxyUrl: null,
    proxyHost: null,
    proxyHostname: null,
    proxyPort: null,
    proxyNetwork: null,
    proxySecret: null,
};

realityEditor.network.desktopURLSchema = new ToolSocket.Schema([
    new ToolSocket.Schema.StringValidator('n', {
        minLength: 1,
        maxLength: 25,
        pattern: /^[A-Za-z0-9_]*$/,
        required: true,
        expected: true,
    }),
    new ToolSocket.Schema.StringValidator('i', {
        minLength: 1,
        maxLength: 25,
        pattern: /^[A-Za-z0-9_]*$/,
    }),
    new ToolSocket.Schema.GroupValidator(
        's',
        [
            new ToolSocket.Schema.StringValidator('s', {
                minLength: 0,
                maxLength: 45,
                pattern: /^[A-Za-z0-9_]*$/,
                required: true,
                expected: true,
            }),
            new ToolSocket.Schema.NullValidator('s'),
            new ToolSocket.Schema.UndefinedValidator('s'),
        ],
        { expected: true }
    ),
    new ToolSocket.Schema.StringValidator('server', {
        minLength: 0,
        maxLength: 2000,
        pattern: /^[A-Za-z0-9~!@$%^&*()-_=+|;:,.]/,
    }),
    new ToolSocket.Schema.StringValidator('protocol', {
        minLength: 1,
        maxLength: 20,
        enum: ['spatialtoolbox', 'ws', 'wss', 'http', 'https'],
    }),
]);

// realityEditor.network.desktopURLSchema = {
//     "type": "object",
//     "items": {
//         "properties": {
//             "n": {"type": "string", "minLength": 1, "maxLength": 25, "pattern": "^[A-Za-z0-9_]*$"},
//             "i": {"type": "string", "minLength": 1, "maxLength": 25, "pattern": "^[A-Za-z0-9_]*$"},
//             "s": {"type": ["string", "null", "undefined"], "minLength": 0, "maxLength": 45, "pattern": "^[A-Za-z0-9_]*$"},
//             "server" : {"type": "string", "minLength": 0, "maxLength": 2000, "pattern": "^[A-Za-z0-9~!@$%^&*()-_=+|;:,.]"},
//             "protocol" : {"type": "string", "minLength": 1, "maxLength": 20, "enum": ["spatialtoolbox", "ws", "wss", "http", "https"]}
//         },
//         "required": ["n"],
//         "expected": ["n", "s"],
//     }
// }
//
// realityEditor.network.urlSchema = {
//     "type": "object",
//     "items": {
//         "properties": {
//             "n": {"type": "string", "minLength": 1, "maxLength": 25, "pattern": "^[A-Za-z0-9_]*$"},
//             "i": {"type": "string", "minLength": 1, "maxLength": 25, "pattern": "^[A-Za-z0-9_]*$"},
//             "s": {"type": ["string", "null", "undefined"], "minLength": 0, "maxLength": 45, "pattern": "^[A-Za-z0-9_]*$"},
//             "server" : {"type": "string", "minLength": 0, "maxLength": 2000, "pattern": "^[A-Za-z0-9~!@$%^&*()-_=+|;:,.]"},
//             "protocol" : {"type": "string", "minLength": 1, "maxLength": 20, "enum": ["spatialtoolbox", "ws", "wss", "http", "https"]}
//         },
//         "required": ["n", "i"],
//         "expected": ["n", "i", "s"],
//     }
// }
//
// realityEditor.network.qrSchema = {
//     "type": "object",
//     "items": {
//         "properties": {
//             "n": {"type": "string", "minLength": 1, "maxLength": 25, "pattern": "^[A-Za-z0-9_]*$"},
//             "s": {"type": ["string", "null", "undefined"], "minLength": 0, "maxLength": 45, "pattern": "^[A-Za-z0-9_]*$"},
//             "server" : {"type": "string", "minLength": 0, "maxLength": 2000, "pattern": "^[A-Za-z0-9~!@$%^&*()-_=+|;:,.]"},
//             "protocol" : {"type": "string", "minLength": 1, "maxLength": 20, "enum": ["spatialtoolbox", "ws", "wss", "http", "https"]}
//         },
//         "required": ["n", "server","protocol"],
//         "expected": ["n", "server", "protocol", "s"],
//     }
// }

/**
 * if the main site is opened with https, we will assume that the main server is running https
 */
realityEditor.network.useHTTPS = location.protocol === 'https:';

/**
 * @type {Array.<{messageName: string, callback: function}>}
 */
realityEditor.network.postMessageHandlers = [];

/**
 * Creates an extendable method for other modules to register callbacks that will be triggered
 * from onInternalPostMessage events, without creating circular dependencies
 * @param {string} messageName
 * @param {function} callback
 */
realityEditor.network.addPostMessageHandler = function (messageName, callback) {
    this.postMessageHandlers.push({
        messageName: messageName,
        callback: callback,
    });
};

realityEditor.network.nodeAddedCallbacks = {};

realityEditor.network.getURL = function (server, identifier, route) {
    let protocol = null;
    let host = null;
    let network = null;
    let destinationIdentifier = null;
    let secret = null;

    if (parseInt(Number(identifier))) {
        protocol = realityEditor.network.useHTTPS ? 'https' : 'http';
        host = `${server}:${identifier}`;
    } else {
        let s = realityEditor.network.state;

        if (s.proxyProtocol && s.proxyHost) {
            protocol = s.proxyProtocol;
            host = s.proxyHost;
        }

        if (s.proxyNetwork) network = s.proxyNetwork;
        if (s.proxySecret) secret = s.proxySecret;
        if (identifier) destinationIdentifier = identifier;
    }

    // concatenate URL
    let returnUrl = protocol + '://' + host;
    if (network) returnUrl += '/n/' + network;
    if (destinationIdentifier) returnUrl += '/i/' + destinationIdentifier;
    if (secret) returnUrl += '/s/' + secret;
    if (route) returnUrl += route;
    return returnUrl;
};

realityEditor.network.getIoTitle = function (identifier, title) {
    if (parseInt(Number(identifier))) {
        return title;
    } else {
        let network = null;
        let destinationIdentifier = null;
        let secret = null;
        let s = realityEditor.network.state;
        if (s.proxyNetwork) network = s.proxyNetwork;
        if (s.proxySecret) secret = s.proxySecret;
        if (identifier) destinationIdentifier = identifier;

        let returnUrl = '';
        if (network) returnUrl += '/n/' + network;
        if (destinationIdentifier) returnUrl += '/i/' + destinationIdentifier;
        if (secret) returnUrl += '/s/' + secret;
        if (title.charAt(0) !== '/') returnUrl += '/';
        if (title) returnUrl += title;
        return returnUrl;
    }
};

realityEditor.network.getPort = function (object) {
    if (typeof object === 'string') {
        console.warn('DEPRECATED getPort', new Error().stack);
        return objects[object].port;
    }
    return object.port;
};
realityEditor.network.getPortByIp = function (ip) {
    if ((ip === '127.0.0.1' || ip === 'localhost') && globalStates.device) {
        return '49369';
    }

    let serverPort = defaultHttpPort;

    for (let key in objects) {
        if (ip === objects[key].ip) {
            serverPort = objects[key].port;
            break;
        }
    }
    return serverPort;
};

/**
 * @type {Array.<{messageName: string, callback: function}>}
 */
realityEditor.network.udpMessageHandlers = [];

/**
 * Creates an extendable method for other modules to register callbacks that will be triggered
 * when the interface receives any UDP message, without creating circular dependencies
 * @param {string} messageName
 * @param {function} callback
 */
realityEditor.network.addUDPMessageHandler = function (messageName, callback) {
    this.udpMessageHandlers.push({
        messageName: messageName,
        callback: callback,
    });
};

/**
 * @type {Array.<function>}
 */
realityEditor.network.objectDiscoveredCallbacks = [];

/**
 * Allow other modules to be notified when a new object is discovered and added to the system.
 * @param {function} callback
 */
realityEditor.network.addObjectDiscoveredCallback = function (callback) {
    this.objectDiscoveredCallbacks.push(callback);

    // trigger the callback for existing objects, if added too late
    for (let [objectKey, object] of Object.entries(objects)) {
        callback(object, objectKey);
    }
};

/**
 * Lists of renderMode callback functions, organized by objectId
 * @type {Object.<string, Array.<function>>}
 */
realityEditor.network.renderModeUpdateCallbacks = {};

/**
 * Allow other modules to be notified when a specific object's renderMode changes. Also triggers once when added.
 * @param {string} objectId
 * @param {function} callback
 */
realityEditor.network.addRenderModeUpdateCallback = function (objectId, callback) {
    if (typeof this.renderModeUpdateCallbacks[objectId] === 'undefined') {
        this.renderModeUpdateCallbacks[objectId] = [];
    }
    this.renderModeUpdateCallbacks[objectId].push(callback);
    let existingObject = realityEditor.getObject(objectId);
    if (!existingObject) return;
    callback(existingObject.renderMode);
};

/**
 * @type {CallbackHandler}
 */
realityEditor.network.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler(
    'network/index'
);

/**
 * Adds a callback function that will be invoked when the specified function is called
 * @param {string} functionName
 * @param {function} callback
 */
realityEditor.network.registerCallback = function (functionName, callback) {
    if (!this.callbackHandler) {
        this.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler('network/index');
    }
    this.callbackHandler.registerCallback(functionName, callback);
};

realityEditor.network.pendingNodeAdjustments = {};

realityEditor.network.addPendingNodeAdjustment = function (
    objectKey,
    frameKey,
    nodeName,
    msgContent
) {
    let pendings = this.pendingNodeAdjustments;
    if (typeof pendings[objectKey] === 'undefined') {
        pendings[objectKey] = {};
    }
    if (typeof pendings[objectKey][frameKey] === 'undefined') {
        pendings[objectKey][frameKey] = {};
    }
    if (typeof pendings[objectKey][frameKey][nodeName] === 'undefined') {
        pendings[objectKey][frameKey][nodeName] = [];
    }

    pendings[objectKey][frameKey][nodeName].push(msgContent);
};

realityEditor.network.processPendingNodeAdjustments = function (
    objectKey,
    frameKey,
    nodeName,
    callback
) {
    let pendings = this.pendingNodeAdjustments;
    if (typeof pendings[objectKey] === 'undefined') {
        return;
    }
    if (typeof pendings[objectKey][frameKey] === 'undefined') {
        return;
    }
    if (typeof pendings[objectKey][frameKey][nodeName] === 'undefined') {
        return;
    }

    pendings[objectKey][frameKey][nodeName].forEach(function (msgContent) {
        callback(objectKey, frameKey, nodeName, JSON.parse(JSON.stringify(msgContent)));
    });
    delete pendings[objectKey][frameKey][nodeName];
};

/**
 * Converts an object with version < 1.7.0 to the new format:
 * Objects now have frames, which can have nodes, but in the old version there were no frames
 *  and the nodes just existed on the object itself
 * @param {Object} thisObject
 * @param {string} objectKey
 * @param {string} frameKey
 */
realityEditor.network.oldFormatToNew = function (thisObject, objectKey, frameKey) {
    if (typeof frameKey === 'undefined') {
        frameKey = objectKey;
    }
    var _this = this;

    if (thisObject.integerVersion < 170) {
        _this.utilities.rename(thisObject, 'folder', 'name');
        _this.utilities.rename(thisObject, 'objectValues', 'nodes');
        _this.utilities.rename(thisObject, 'objectLinks', 'links');
        delete thisObject['matrix3dMemory'];

        if (!thisObject.frames) thisObject.frames = {};

        thisObject.frames[frameKey].name = thisObject.name;
        thisObject.frames[frameKey].nodes = thisObject.nodes;
        thisObject.frames[frameKey].links = thisObject.links;

        for (let linkKey in objects[objectKey].frames[frameKey].links) {
            thisObject = objects[objectKey].frames[frameKey].links[linkKey];

            _this.utilities.rename(thisObject, 'ObjectA', 'objectA');
            _this.utilities.rename(thisObject, 'locationInA', 'nodeA');
            if (!thisObject.frameA) thisObject.frameA = thisObject.objectA;
            _this.utilities.rename(thisObject, 'ObjectNameA', 'nameA');

            _this.utilities.rename(thisObject, 'ObjectB', 'objectB');
            _this.utilities.rename(thisObject, 'locationInB', 'nodeB');
            if (!thisObject.frameB) thisObject.frameB = thisObject.objectB;
            _this.utilities.rename(thisObject, 'ObjectNameB', 'nameB');
            _this.utilities.rename(thisObject, 'endlessLoop', 'loop');
            _this.utilities.rename(thisObject, 'countLinkExistance', 'health');
        }

        /*for (var nodeKey in objects[objectKey].nodes) {
         _this.utilities.rename(objects[objectKey].nodes, nodeKey, objectKey + nodeKey);
         }*/
        for (let nodeKey in objects[objectKey].frames[frameKey].nodes) {
            thisObject = objects[objectKey].frames[frameKey].nodes[nodeKey];
            _this.utilities.rename(thisObject, 'plugin', 'type');
            _this.utilities.rename(thisObject, 'appearance', 'type');

            if (thisObject.type === 'default') {
                thisObject.type = 'node';
            }

            thisObject.data = {
                value: thisObject.value,
                mode: thisObject.mode,
                unit: '',
                unitMin: 0,
                unitMax: 1,
            };
            delete thisObject.value;
            delete thisObject.mode;
        }
    }

    objects[objectKey].uuid = objectKey;
    objects[objectKey].frames[frameKey].uuid = frameKey;

    for (let nodeKey in objects[objectKey].frames[frameKey].nodes) {
        objects[objectKey].frames[frameKey].nodes[nodeKey].uuid = nodeKey;
    }

    for (let linkKey in objects[objectKey].frames[frameKey].links) {
        objects[objectKey].frames[frameKey].links[linkKey].uuid = linkKey;
    }
};

/**
 * Properly initialize all the temporary, editor-only state for an object when it first gets added
 * @param {string} objectKey
 */
realityEditor.network.onNewObjectAdded = function (objectKey) {
    realityEditor.app.tap();

    var thisObject = realityEditor.getObject(objectKey);
    // this is a work around to set the state of an objects to not being visible.
    realityEditor.gui.ar.draw.setObjectVisible(thisObject, false);
    thisObject.screenZ = 1000;
    thisObject.fullScreen = false;
    thisObject.sendMatrix = false;
    thisObject.sendMatrices = {
        model: false,
        view: false,
        modelView: false,
        devicePose: false,
        groundPlane: false,
        anchoredModelView: false,
        allObjects: false,
    };
    thisObject.sendScreenPosition = false;
    thisObject.sendAcceleration = false;
    thisObject.integerVersion = parseInt(objects[objectKey].version.replace(/\./g, ''));

    if (typeof thisObject.matrix === 'undefined') {
        thisObject.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }

    let isImageTarget =
        !(thisObject.isWorldObject || thisObject.type === 'world') &&
        !realityEditor.gui.ar.anchors.isAnchorObject(objectKey) &&
        !realityEditor.avatar.utils.isAvatarObject(thisObject) &&
        !realityEditor.humanPose.utils.isHumanPoseObject(thisObject);

    realityEditor.sceneGraph.addObject(objectKey, thisObject.matrix, isImageTarget);

    // thisObject.unpinnedFrameKeys = {};
    // thisObject.visibleUnpinnedFrames = {};

    for (let frameKey in objects[objectKey].frames) {
        var thisFrame = realityEditor.getFrame(objectKey, frameKey);
        realityEditor.network.initializeDownloadedFrame(objectKey, frameKey, thisFrame);
    }

    // Object.keys(thisObject.unpinnedFrameKeys).forEach(function(frameKey) {
    //     console.log('deleted unpinned frame (for now): ' + frameKey);
    //     delete thisObject.frames[frameKey];
    // });

    if (!thisObject.protocol) {
        thisObject.protocol = 'R0';
    }

    objects[objectKey].uuid = objectKey;

    for (let frameKey in objects[objectKey].frames) {
        objects[objectKey].frames[frameKey].uuid = frameKey;
        for (let nodeKey in objects[objectKey].frames[frameKey].nodes) {
            objects[objectKey].frames[frameKey].nodes[nodeKey].uuid = nodeKey;
        }

        for (let linkKey in objects[objectKey].frames[frameKey].links) {
            objects[objectKey].frames[frameKey].links[linkKey].uuid = linkKey;
        }
    }

    realityEditor.gui.ar.utilities.setAverageScale(objects[objectKey]);

    this.cout(JSON.stringify(objects[objectKey]));

    // todo this needs to be looked at
    realityEditor.gui.memory.addObjectMemory(objects[objectKey]);

    // notify subscribed modules that a new object was added
    realityEditor.network.objectDiscoveredCallbacks.forEach(function (callback) {
        callback(objects[objectKey], objectKey);
    });
};

realityEditor.network.initializeDownloadedFrame = function (objectKey, frameKey, thisFrame) {
    // thisFrame.objectVisible = false; // gets set to false in draw.setObjectVisible function
    thisFrame.screenZ = 1000;
    thisFrame.fullScreen = false;
    thisFrame.sendMatrix = false;
    thisFrame.sendMatrices = {
        model: false,
        view: false,
        modelView: false,
        devicePose: false,
        groundPlane: false,
        anchoredModelView: false,
        allObjects: false,
    };
    thisFrame.sendScreenPosition = false;
    thisFrame.sendAcceleration = false;
    thisFrame.integerVersion = parseInt(objects[objectKey].version.replace(/\./g, '')) || 300;
    thisFrame.visible = false;
    thisFrame.objectId = objectKey;

    if (typeof thisFrame.developer === 'undefined') {
        thisFrame.developer = true;
    }

    var positionData = realityEditor.gui.ar.positioning.getPositionData(thisFrame);

    if (positionData.matrix === null || typeof positionData.matrix !== 'object') {
        positionData.matrix = [];
    }

    realityEditor.sceneGraph.addFrame(objectKey, frameKey, thisFrame, positionData.matrix);
    realityEditor.gui.ar.groundPlaneAnchors.sceneNodeAdded(
        objectKey,
        frameKey,
        thisFrame,
        positionData.matrix
    );

    for (let nodeKey in thisFrame.nodes) {
        var thisNode = thisFrame.nodes[nodeKey];
        realityEditor.network.initializeDownloadedNode(objectKey, frameKey, nodeKey, thisNode);
    }

    // TODO: invert dependency
    realityEditor.gui.ar.grouping.reconstructGroupStruct(frameKey, thisFrame);
};

realityEditor.network.initializeDownloadedNode = function (objectKey, frameKey, nodeKey, thisNode) {
    if (thisNode.matrix === null || typeof thisNode.matrix !== 'object') {
        thisNode.matrix = [];
    }

    thisNode.objectId = objectKey;
    thisNode.frameId = frameKey;
    thisNode.loaded = false;
    thisNode.visible = false;

    if (typeof thisNode.publicData !== 'undefined') {
        if (!publicDataCache.hasOwnProperty(frameKey)) {
            publicDataCache[frameKey] = {};
        }
        publicDataCache[frameKey][thisNode.name] = thisNode.publicData;
    }

    if (thisNode.type === 'logic') {
        thisNode.guiState = new LogicGUIState();
        let container = document.getElementById('craftingBoard');
        thisNode.grid = new realityEditor.gui.crafting.grid.Grid(
            container.clientWidth - realityEditor.gui.crafting.menuBarWidth,
            container.clientHeight,
            CRAFTING_GRID_WIDTH,
            CRAFTING_GRID_HEIGHT,
            nodeKey
        );
        //_this.realityEditor.gui.crafting.utilities.convertLinksFromServer(thisObject);
    }

    realityEditor.sceneGraph.addNode(objectKey, frameKey, nodeKey, thisNode, thisNode.matrix);
};

/**
 * Looks at an object heartbeat, and if the object hasn't been added yet, downloads it and initializes all appropriate state
 * @param {{id: string, ip: string, vn: number, tcs: string, zone: string}} beat - object heartbeat received via UDP
 */
realityEditor.network.addHeartbeatObject = function (beat) {
    if (!realityEditor.device.loaded) {
        // addHeartbeatObject called before init done
        setTimeout(() => {
            realityEditor.network.addHeartbeatObject(beat);
        }, 500);
        return;
    }

    if (beat && beat.id) {
        if (!objects[beat.id]) {
            // ignore this object if it's a world object and the primaryWorld is set but not equal to this one
            // we make sure to ignore it before triggering the GET request, otherwise we might overload the network
            let primaryWorldInfo = realityEditor.network.discovery.getPrimaryWorldInfo();
            let isLocalWorld = beat.id === realityEditor.worldObjects.getLocalWorldId();
            let isWorldBeat = realityEditor.worldObjects.isWorldObjectKey(beat.id);
            if (primaryWorldInfo && isWorldBeat && !isLocalWorld) {
                let hasIpInfo = primaryWorldInfo.ip;
                if (
                    beat.id !== primaryWorldInfo.id ||
                    (hasIpInfo && beat.ip !== primaryWorldInfo.ip)
                ) {
                    // console.warn('ignoring adding world object ' + beat.id + ' because it doesnt match primary world ' + primaryWorldInfo.id);
                    return;
                }
            }

            // download the object data from its server
            let baseUrl = realityEditor.network.getURL(
                beat.ip,
                realityEditor.network.getPort(beat),
                '/object/' + beat.id
            );
            let queryParams = '?excludeUnpinned=true';
            this.getData(
                beat.id,
                null,
                null,
                baseUrl + queryParams,
                function (objectKey, frameKey, nodeKey, msg) {
                    if (msg && objectKey && !objects[objectKey]) {
                        // add the object
                        objects[objectKey] = msg;
                        objects[objectKey].ip = beat.ip;
                        if (beat.network) objects[objectKey].network = beat.network;
                        if (beat.port) objects[objectKey].port = beat.port;
                        // initialize temporary state and notify other modules
                        realityEditor.network.onNewObjectAdded(objectKey);

                        var doesDeviceSupportJPGTargets = true; // TODO: verify this somehow instead of always true
                        if (doesDeviceSupportJPGTargets) {
                            // this tries DAT first, then resorts to JPG if DAT not found
                            realityEditor.app.targetDownloader.downloadAvailableTargetFiles(beat);
                        } else {
                            // download XML, DAT, and initialize tracker
                            realityEditor.app.targetDownloader.downloadTargetFilesForDiscoveredObject(
                                beat
                            );
                        }

                        // check if onNewServerDetected callbacks should be triggered
                        realityEditor.network.checkIfNewServer(beat.ip); //, objectKey);
                    }
                }
            );
        } else {
            // if we receive a heartbeat of an object that has been created but it still needs targets
            // try to re-download its target data if possible/necessary
            var isInitialized =
                realityEditor.app.targetDownloader.isObjectTargetInitialized(beat.id) || // either target downloaded
                beat.id === realityEditor.worldObjects.getLocalWorldId(); // or it's the _WORLD_local

            if (
                !isInitialized &&
                realityEditor.app.targetDownloader.isObjectReadyToRetryDownload(beat.id, beat.tcs)
            ) {
                setTimeout(function () {
                    realityEditor.app.targetDownloader.downloadAvailableTargetFiles(beat);
                }, 1000);
            }
        }
    }
};

realityEditor.network.knownServers = []; // todo: make private to module
realityEditor.network.newServerDetectedCallbacks = [];

/**
 * Register a callback that will trigger for each serverIP currently known to the system and each new one as it is detected
 * @todo: use this method more consistently across the codebase instead of several modules implementing similar behavior
 * @param {function} callback
 */
realityEditor.network.onNewServerDetected = function (callback) {
    // register callback for future detections
    this.newServerDetectedCallbacks.push(callback);

    // immediate trigger for already known servers
    this.knownServers.forEach(function (serverIP) {
        callback(serverIP);
    });
};

/**
 * Checks if a server has already been detected, and if not, detect it and trigger callbacks
 * @param {string} serverIP
 */
realityEditor.network.checkIfNewServer = function (serverIP) {
    var foundExistingMatch = this.knownServers.indexOf(serverIP) > -1; // TODO: make robust against different formatting of "same" IP

    if (!foundExistingMatch) {
        this.knownServers.push(serverIP);

        // trigger callbacks
        this.newServerDetectedCallbacks.forEach(function (callback) {
            callback(serverIP);
        });
    }
};

/**
 * Updates an entire object, including all of its frames and nodes, to be in sync with the remote version on the server
 * @param {Objects} origin - the local copy of the Object
 * @param {Objects} remote - the copy of the Object downloaded from the server
 * @param {string} objectKey
 * @param {string} avatarName
 */
realityEditor.network.updateObject = function (origin, remote, objectKey, avatarName) {
    origin.x = remote.x;
    origin.y = remote.y;
    origin.scale = remote.scale;

    if (remote.matrix) {
        origin.matrix = remote.matrix;
    }

    // triggers any renderModeUpdateCallbacks if the object's renderMode has changed
    if (origin.renderMode !== remote.renderMode) {
        origin.renderMode = remote.renderMode;

        if (typeof this.renderModeUpdateCallbacks[objectKey] !== 'undefined') {
            this.renderModeUpdateCallbacks[objectKey].forEach((callback) => {
                callback(origin.renderMode);
            });
        }
    }

    // update each frame in the object // TODO: create an updateFrame function, the same way we have an updateNode function
    for (let frameKey in remote.frames) {
        let prevVisualization = origin.frames[frameKey]
            ? origin.frames[frameKey].visualization
            : null;
        let newVisualization = remote.frames[frameKey]
            ? remote.frames[frameKey].visualization
            : null;

        if (!remote.frames.hasOwnProperty(frameKey)) continue;
        if (!origin.frames[frameKey]) {
            origin.frames[frameKey] = remote.frames[frameKey];

            origin.frames[frameKey].width = remote.frames[frameKey].width || 300;
            origin.frames[frameKey].height = remote.frames[frameKey].height || 300;

            origin.frames[frameKey].uuid = frameKey;

            realityEditor.network.initializeDownloadedFrame(
                objectKey,
                frameKey,
                origin.frames[frameKey]
            );
            // todo Steve: added a new frame
            realityEditor.network.callbackHandler.triggerCallbacks('frameAdded', {
                objectKey: objectKey,
                frameKey: frameKey,
                frameType: origin.frames[frameKey].src,
                nodeKey: null,
                additionalInfo: { avatarName: avatarName },
            });
        } else {
            origin.frames[frameKey].visualization = remote.frames[frameKey].visualization;
            origin.frames[frameKey].ar = remote.frames[frameKey].ar;
            origin.frames[frameKey].screen = remote.frames[frameKey].screen;
            origin.frames[frameKey].name = remote.frames[frameKey].name;

            // now update each node in the frame
            var remoteNodes = remote.frames[frameKey].nodes;
            var originNodes = origin.frames[frameKey].nodes;

            for (let nodeKey in remoteNodes) {
                if (!remoteNodes.hasOwnProperty(nodeKey)) continue;

                var originNode = originNodes[nodeKey];
                var remoteNode = remoteNodes[nodeKey];
                realityEditor.network.updateNode(
                    originNode,
                    remoteNode,
                    objectKey,
                    frameKey,
                    nodeKey
                );
            }

            // remove extra nodes from origin that don't exist in remote
            for (let nodeKey in originNodes) {
                if (originNodes.hasOwnProperty(nodeKey) && !remoteNodes.hasOwnProperty(nodeKey)) {
                    realityEditor.gui.ar.draw.deleteNode(objectKey, frameKey, nodeKey);
                    realityEditor.network.callbackHandler.triggerCallbacks('vehicleDeleted', {
                        objectKey: objectKey,
                        frameKey: frameKey,
                        nodeKey: nodeKey,
                        additionalInfo: {},
                    });
                }
            }
        }

        origin.frames[frameKey].links = JSON.parse(JSON.stringify(remote.frames[frameKey].links));

        // TODO: invert dependency
        realityEditor.gui.ar.grouping.reconstructGroupStruct(frameKey, origin.frames[frameKey]);

        // this makes the tools load properly when pulling out of screens, pushing into screens
        let visualizationChanged =
            prevVisualization && newVisualization && prevVisualization !== newVisualization;
        if (globalDOMCache['iframe' + frameKey] && visualizationChanged) {
            if (globalDOMCache['iframe' + frameKey].getAttribute('loaded')) {
                realityEditor.network.onElementLoad(objectKey, frameKey, null);
            }
        }
    }

    // remove extra frames from origin that don't exist in remote
    for (let frameKey in origin.frames) {
        if (origin.frames.hasOwnProperty(frameKey) && !remote.frames.hasOwnProperty(frameKey)) {
            // delete origin.frames[frameKey];
            let frameType = origin.frames[frameKey].src;
            realityEditor.gui.ar.draw.deleteFrame(objectKey, frameKey);
            realityEditor.network.callbackHandler.triggerCallbacks('vehicleDeleted', {
                objectKey: objectKey,
                frameKey: frameKey,
                nodeKey: null,
                additionalInfo: { frameType: frameType, avatarName: avatarName },
            });
        }
    }
};

/**
 * Updates a node (works for logic nodes too) to be in sync with the remote version on the server
 * @param {Node|Logic} origin - the local copy
 * @param {Node|Logic} remote - the copy downloaded from the server
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 */
realityEditor.network.updateNode = function (origin, remote, objectKey, frameKey, nodeKey) {
    var isRemoteNodeDeleted = Object.keys(remote).length === 0 && remote.constructor === Object;

    // delete local node if it exists locally but not on the server
    if (origin && isRemoteNodeDeleted) {
        realityEditor.gui.ar.draw.deleteNode(objectKey, frameKey, nodeKey);

        var thisNode = realityEditor.getNode(objectKey, frameKey, nodeKey);

        if (thisNode) {
            delete objects[objectKey].frames[frameKey].nodes[nodeKey];
        }
        return;
    }

    // create the local node if it exists on the server but not locally
    if (!origin) {
        origin = remote;

        if (origin.type === 'logic') {
            if (!origin.guiState) {
                origin.guiState = new LogicGUIState();
            }

            if (!origin.grid) {
                let container = document.getElementById('craftingBoard');
                origin.grid = new realityEditor.gui.crafting.grid.Grid(
                    container.clientWidth - realityEditor.gui.crafting.menuBarWidth,
                    container.clientHeight,
                    CRAFTING_GRID_WIDTH,
                    CRAFTING_GRID_HEIGHT,
                    origin.uuid
                );
            }
        }

        objects[objectKey].frames[frameKey].nodes[nodeKey] = origin;

        let positionData = realityEditor.gui.ar.positioning.getPositionData(origin);
        realityEditor.sceneGraph.addNode(objectKey, frameKey, nodeKey, origin, positionData.matrix);
    } else {
        // update the local node's properties to match the one on the server if they both exists

        origin.x = remote.x;
        origin.y = remote.y;
        origin.scale = remote.scale;
        origin.name = remote.name;
        origin.frameId = frameKey;
        origin.objectId = objectKey;

        if (remote.text) {
            origin.text = remote.text;
        }
        if (remote.matrix) {
            origin.matrix = remote.matrix;
        }
        origin.lockPassword = remote.lockPassword;
        origin.lockType = remote.lockType;
        origin.publicData = remote.publicData;
        // console.log("update node: lockPassword = " + remote.lockPassword + ", lockType = " + remote.lockType);

        // set up the crafting board for the local node if it's a logic node
        if (origin.type === 'logic') {
            if (!origin.guiState) {
                origin.guiState = new LogicGUIState();
            }

            if (!origin.grid) {
                let container = document.getElementById('craftingBoard');
                origin.grid = new realityEditor.gui.crafting.grid.Grid(
                    container.clientWidth - realityEditor.gui.crafting.menuBarWidth,
                    container.clientHeight,
                    CRAFTING_GRID_WIDTH,
                    CRAFTING_GRID_HEIGHT,
                    origin.uuid
                );
            }
        }
    }

    // if it's a logic node, update its logic blocks and block links to match the remote, and re-render them if the board is open
    if (remote.blocks) {
        this.utilities.syncBlocksWithRemote(origin, remote.blocks);
    }

    if (remote.links) {
        this.utilities.syncLinksWithRemote(origin, remote.links);
    }

    if (globalStates.currentLogic) {
        if (globalStates.currentLogic.uuid === nodeKey) {
            if (remote.type === 'logic') {
                realityEditor.gui.crafting.updateGrid(
                    objects[objectKey].frames[frameKey].nodes[nodeKey].grid
                );
            }

            realityEditor.gui.crafting.forceRedraw(globalStates.currentLogic);
        }
    } else {
        if (globalDOMCache['iframe' + nodeKey]) {
            if (globalDOMCache['iframe' + nodeKey].getAttribute('loaded')) {
                realityEditor.network.onElementLoad(objectKey, frameKey, nodeKey);
            }
        }
    }
};

/**
 * When we receive any UDP message, this function triggers so that subscribed modules can react to specific messages
 * @param {string|object} message
 */
realityEditor.network.onUDPMessage = function (message) {
    if (typeof message === 'string') {
        try {
            message = JSON.parse(message);
        } catch (error) {
            // error parsing JSON
        }
    }

    this.udpMessageHandlers.forEach(function (messageHandler) {
        if (typeof message[messageHandler.messageName] !== 'undefined') {
            messageHandler.callback(message);
        }
    });
};

/**
 * When the app receives a UDP message with a field called "action", this gets triggered with the action contents.
 * Actions listened for include reload(Object|Frame|Node|Link), advertiseConnection, load(Memory|LogicIcon) and addFrame
 * @param {object|string} action
 */
realityEditor.network.onAction = function (action) {
    var _this = this;
    var thisAction;
    if (typeof action === 'object') {
        thisAction = action;
    } else {
        while (action.charAt(0) === '"') action = action.substr(1);
        while (action.charAt(action.length - 1) === ' ')
            action = action.substring(0, action.length - 1);
        while (action.charAt(action.length - 1) === '"')
            action = action.substring(0, action.length - 1);

        thisAction = {
            action: action,
        };
    }

    if (thisAction.lastEditor === globalStates.tempUuid) {
        return;
    }

    // reload links for a specific object.

    if (typeof thisAction.reloadLink !== 'undefined') {
        // compatibility with old version where object was ID
        if (thisAction.reloadLink.id) {
            thisAction.reloadLink.object = thisAction.reloadLink.id;
            // TODO: BEN set thisAction.reloadFrame
        }

        if (thisAction.reloadLink.object in objects) {
            let urlEndpoint = realityEditor.network.getURL(
                objects[thisAction.reloadLink.object].ip,
                realityEditor.network.getPort(objects[thisAction.reloadLink.object]),
                '/object/' + thisAction.reloadLink.object + '/frame/' + thisAction.reloadLink.frame
            );
            this.getData(
                thisAction.reloadLink.object,
                thisAction.reloadLink.frame,
                null,
                urlEndpoint,
                function (objectKey, frameKey, nodeKey, res) {
                    // });
                    // this.getData((realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + objects[thisAction.reloadLink.object].ip + ':' + httpPort + '/object/' + thisAction.reloadLink.object + '/frame/' +thisAction.reloadLink.frame, thisAction.reloadLink.object, function (req, thisKey, frameKey) {

                    var thisFrame = realityEditor.getFrame(objectKey, frameKey);
                    if (objects[objectKey].integerVersion < 170) {
                        realityEditor.network.oldFormatToNew(
                            objects[objectKey],
                            objectKey,
                            frameKey
                        );
                        /*
                    objects[thisKey].links = req.links;
                    for (var linkKey in objects[thisKey].links) {
                        var thisObject = objects[thisKey].links[linkKey];

                        _this.utilities.rename(thisObject, "ObjectA", "objectA");
                        _this.utilities.rename(thisObject, "locationInA", "nodeA");
                        _this.utilities.rename(thisObject, "ObjectNameA", "nameA");

                        _this.utilities.rename(thisObject, "ObjectB", "objectB");
                        _this.utilities.rename(thisObject, "locationInB", "nodeB");
                        _this.utilities.rename(thisObject, "ObjectNameB", "nameB");
                        _this.utilities.rename(thisObject, "endlessLoop", "loop");
                        _this.utilities.rename(thisObject, "countLinkExistance", "health");
                    }
                    */
                    } else {
                        thisFrame.links = res.links;
                    }

                    objects[objectKey].uuid = objectKey;
                    thisFrame.uuid = frameKey;

                    for (let nodeKey in thisFrame.nodes) {
                        thisFrame.nodes[nodeKey].uuid = nodeKey;
                    }

                    for (let linkKey in thisFrame.links) {
                        thisFrame.links[linkKey].uuid = linkKey;
                    }

                    // cout(objects[thisKey]);

                    _this.cout('got links');
                }
            );
        }
    }

    if (typeof thisAction.reloadObject !== 'undefined') {
        if (thisAction.reloadObject.object in objects) {
            let objectIP = objects[thisAction.reloadObject.object].ip;
            let urlEndpoint = realityEditor.network.getURL(
                objectIP,
                realityEditor.network.getPort(objects[thisAction.reloadObject.object]),
                '/object/' + thisAction.reloadObject.object
            );

            this.getData(
                thisAction.reloadObject.object,
                thisAction.reloadObject.frame,
                null,
                urlEndpoint,
                function (objectKey, frameKey, nodeKey, res) {
                    if (!res) {
                        delete objects[objectKey];
                        realityEditor.network.callbackHandler.triggerCallbacks('objectDeleted', {
                            objectKey: objectKey,
                            objectIP: objectIP,
                        });
                        return;
                    }

                    if (objects[objectKey].integerVersion < 170) {
                        if (typeof res.objectValues !== 'undefined') {
                            res.nodes = res.objectValues;
                        }
                    }

                    let avatarId = realityEditor.avatar.getAvatarObjectKeyFromSessionId(
                        thisAction.lastEditor
                    );
                    realityEditor.network.updateObject(
                        objects[objectKey],
                        res,
                        objectKey,
                        avatarId
                    );

                    _this.cout('got object');
                },
                { bypassCache: true }
            );
        }
    }

    if (typeof thisAction.reloadFrame !== 'undefined') {
        let thisFrame = realityEditor.getFrame(
            thisAction.reloadFrame.object,
            thisAction.reloadFrame.frame
        );

        // only reload the frame if it already exists – if it doesn't, it needs to be added with reloadObject in order to intialize properly
        if (thisFrame) {
            realityEditor.network.reloadFrame(
                thisAction.reloadFrame.object,
                thisAction.reloadFrame.frame,
                thisAction
            );
        } else {
            setTimeout(() => {
                realityEditor.network.reloadFrame(
                    thisAction.reloadFrame.object,
                    thisAction.reloadFrame.frame,
                    thisAction
                );
            }, 500);
        }
    }

    if (typeof thisAction.reloadNode !== 'undefined') {
        let thisFrame = realityEditor.getFrame(
            thisAction.reloadNode.object,
            thisAction.reloadNode.frame
        );

        if (thisFrame !== null) {
            // TODO: getData         webServer.get('/object/*/') ... instead of /object/node

            let urlEndpoint = realityEditor.network.getURL(
                objects[thisAction.reloadNode.object].ip,
                realityEditor.network.getPort(objects[thisAction.reloadNode.object]),
                '/object/' +
                    thisAction.reloadNode.object +
                    '/frame/' +
                    thisAction.reloadNode.frame +
                    '/node/' +
                    thisAction.reloadNode.node +
                    '/'
            );
            this.getData(
                thisAction.reloadObject.object,
                thisAction.reloadObject.frame,
                thisAction.reloadObject.node,
                urlEndpoint,
                function (objectKey, frameKey, nodeKey, res) {
                    // this.getData(
                    // (realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + objects[thisAction.reloadNode.object].ip + ':' + httpPort + '/object/' + thisAction.reloadNode.object + "/node/" + thisAction.reloadNode.node + "/", thisAction.reloadNode.object, function (req, objectKey, frameKey, nodeKey) {

                    var thisFrame = realityEditor.getFrame(objectKey, frameKey);

                    if (!thisFrame.nodes[nodeKey]) {
                        thisFrame.nodes[nodeKey] = res;
                    } else {
                        realityEditor.network.updateNode(
                            thisFrame.nodes[nodeKey],
                            res,
                            objectKey,
                            frameKey,
                            nodeKey
                        );
                    }

                    _this.cout('got object');
                },
                thisAction.reloadNode.node
            );
        }
    }

    if (thisAction.loadMemory) {
        var id = thisAction.loadMemory.object;
        let urlEndpoint = realityEditor.network.getURL(
            thisAction.loadMemory.ip,
            realityEditor.network.getPort(objects[id]),
            '/object/' + id
        );
        this.getData(id, null, null, urlEndpoint, function (objectKey, frameKey, nodeKey, res) {
            // this.getData(url, id, function (req, thisKey) {
            _this.cout('received memory', res.memory);
            objects[objectKey].memory = res.memory;
            objects[objectKey].memoryCameraMatrix = res.memoryCameraMatrix;
            objects[objectKey].memoryProjectionMatrix = res.memoryProjectionMatrix;

            // _this.realityEditor.gui.memory.addObjectMemory(objects[objectKey]);
        });
    }

    if (thisAction.loadLogicIcon) {
        this.loadLogicIcon(thisAction.loadLogicIcon);
    }

    // Set states to locate object in space
    if (thisAction.spatial) {
        if (thisAction.spatial.locator) {
            let spatial = globalStates.spatial;
            let action = thisAction.spatial.locator;
            if (!thisAction.spatial.ip) return;
            if (action.whereIs) {
                spatial.whereIs[thisAction.spatial.ip] = JSON.parse(JSON.stringify(action.whereIs));
            }

            if (action.whereWas) {
                spatial.whereWas[thisAction.spatial.ip] = JSON.parse(
                    JSON.stringify(action.whereWas)
                );
            }

            if (action.howFarIs) {
                spatial.howFarIs[thisAction.spatial.ip] = JSON.parse(
                    JSON.stringify(action.howFarIs)
                );
            }

            if (action.velocityOf) {
                spatial.velocityOf[thisAction.spatial.ip] = JSON.parse(
                    JSON.stringify(action.velocityOf)
                );
            }
        }
        realityEditor.gui.spatial.checkState();
    }

    if (thisAction.addFrame) {
        let thisObject = realityEditor.getObject(thisAction.addFrame.objectID);

        if (thisObject) {
            var frame = new Frame();

            frame.objectId = thisAction.addFrame.objectID;
            frame.name = thisAction.addFrame.name;

            var frameID = frame.objectId + frame.name;
            frame.uuid = frameID;

            frame.ar.x = thisAction.addFrame.x;
            frame.ar.y = thisAction.addFrame.y;
            frame.ar.scale = thisAction.addFrame.scale;
            frame.frameSizeX = thisAction.addFrame.frameSizeX;
            frame.frameSizeY = thisAction.addFrame.frameSizeY;

            frame.location = thisAction.addFrame.location;
            frame.src = thisAction.addFrame.src;

            // set other properties

            frame.animationScale = 0;
            frame.begin = realityEditor.gui.ar.utilities.newIdentityMatrix();
            frame.width = frame.frameSizeX;
            frame.height = frame.frameSizeY;
            frame.loaded = false;
            // frame.objectVisible = true;
            frame.screen = {
                x: frame.ar.x,
                y: frame.ar.y,
                scale: frame.ar.scale,
                matrix: frame.ar.matrix,
            };
            // frame.screenX = 0;
            // frame.screenY = 0;
            frame.screenZ = 1000;
            frame.temp = realityEditor.gui.ar.utilities.newIdentityMatrix();

            // thisFrame.objectVisible = false; // gets set to false in draw.setObjectVisible function
            frame.fullScreen = false;
            frame.sendMatrix = false;
            frame.sendMatrices = {
                model: false,
                view: false,
                modelView: false,
                devicePose: false,
                groundPlane: false,
                anchoredModelView: false,
                allObjects: false,
            };
            frame.sendScreenPosition = false;
            frame.sendAcceleration = false;
            frame.integerVersion = 300; //parseInt(objects[objectKey].version.replace(/\./g, ""));
            // thisFrame.visible = false;

            var nodeNames = thisAction.addFrame.nodeNames;
            nodeNames.forEach(function (nodeName) {
                var nodeUuid = frameID + nodeName;
                frame.nodes[nodeUuid] = new Node();
                var addedNode = frame.nodes[nodeUuid];
                addedNode.objectId = thisAction.addFrame.objectID;
                addedNode.frameId = frameID;
                addedNode.name = nodeName;
                addedNode.text = undefined;
                addedNode.type = 'node';
                addedNode.x = 0; //realityEditor.utilities.randomIntInc(0, 200) - 100;
                addedNode.y = 0; //realityEditor.utilities.randomIntInc(0, 200) - 100;
                addedNode.frameSizeX = 100;
                addedNode.frameSizeY = 100;
            });

            thisObject.frames[frameID] = frame;
        }

        // if (objects) {
        //     var thisObject = objects[thisAction.addFrame.objectID];
        //
        //
        //
        //     var urlEndpoint = (realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + objects[thisAction.reloadObject.object].ip + ':' + httpPort + '/object/' + thisAction.reloadObject.object;
        //     this.getData(thisAction.reloadObject.object, thisAction.reloadObject.frame, null, urlEndpoint, function (objectKey, frameKey, nodeKey, res) {
        //
        //         // }
        //         // this.getData((realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + objects[thisAction.reloadObject.object].ip + ':' + httpPort + '/object/' + thisAction.reloadObject.object, thisAction.reloadObject.object, function (req, thisKey) {
        //
        //         if (objects[objectKey].integerVersion < 170) {
        //             if (typeof res.objectValues !== "undefined") {
        //                 res.nodes = res.objectValues;
        //             }
        //         }
        //
        //         console.log("updateObject", objects[objectKey], res, objectKey, frameKey);
        //
        //
        //         _this.cout("got object");
        //
        //     });
        // }
    }

    for (let key in thisAction) {
        this.cout('found action: ' + JSON.stringify(key));
    }
};

realityEditor.network.reloadFrame = function (objectKey, frameKey, fullActionMessage) {
    let thisObject = realityEditor.getObject(objectKey);
    let thisFrame = realityEditor.getFrame(objectKey, frameKey);
    if (!thisObject || !thisFrame) return;

    let urlEndpoint = realityEditor.network.getURL(
        thisObject.ip,
        realityEditor.network.getPort(thisObject),
        '/object/' + objectKey + '/frame/' + frameKey
    );
    this.getData(
        objectKey,
        frameKey,
        null,
        urlEndpoint,
        (objectKey, frameKey, nodeKey, res) => {
            let propertiesToIgnore = fullActionMessage.reloadFrame.propertiesToIgnore;
            let wasTriggeredFromEditor = fullActionMessage.reloadFrame.wasTriggeredFromEditor;

            for (let thisKey in res) {
                if (!res.hasOwnProperty(thisKey)) continue;
                if (!thisFrame.hasOwnProperty(thisKey)) continue;
                if (propertiesToIgnore) {
                    if (propertiesToIgnore.indexOf(thisKey) > -1) continue;

                    if (
                        thisFrame.ar.x !== res.ar.x ||
                        thisFrame.ar.y !== res.ar.y ||
                        !realityEditor.gui.ar.utilities.isEqualStrict(
                            thisFrame.ar.matrix,
                            res.ar.matrix
                        )
                    ) {
                        // todo Steve: find a way to store & compare the original & updated positions of the frame, and trigger framePosition event here
                        // realityEditor.network.callbackHandler.triggerCallbacks('frameRepositioned', {objectKey: thisFrame.objectId, frameKey: thisFrame.uuid, nodeKey: null, additionalInfo: {frameType: thisFrame.src, avatarName: realityEditor.avatar.getAvatarObjectKeyFromSessionId(thisAction.lastEditor)}});
                    }

                    // TODO: this is a temp fix to just ignore ar.x and ar.y but still send scale... find a more general way
                    if (
                        thisKey === 'ar' &&
                        propertiesToIgnore.indexOf('ar.x') > -1 &&
                        propertiesToIgnore.indexOf('ar.y') > -1
                    ) {
                        // this wasn't scaled -> update the x and y but not the scale
                        if (thisFrame.ar.scale === res.ar.scale && !wasTriggeredFromEditor) {
                            thisFrame.ar.x = res.ar.x;
                            thisFrame.ar.y = res.ar.y;
                        } else {
                            // this was scaled -> update the scale but not the x and y
                            thisFrame.ar.scale = res.ar.scale;
                        }
                        continue;
                    }

                    // only rewrite existing properties of nodes, otherwise node.loaded gets removed and another element added
                    if (thisKey === 'nodes') {
                        for (let nodeKey in res.nodes) {
                            if (!thisFrame.nodes.hasOwnProperty(nodeKey)) {
                                thisFrame.nodes[nodeKey] = res.nodes[nodeKey];
                            } else {
                                for (let propertyKey in res.nodes[nodeKey]) {
                                    if (propertyKey === 'loaded') {
                                        continue;
                                    }
                                    thisFrame.nodes[nodeKey][propertyKey] =
                                        res.nodes[nodeKey][propertyKey];
                                }
                            }
                        }
                        continue;
                    }
                }

                thisFrame[thisKey] = res[thisKey];
            }

            realityEditor.gui.ar.grouping.reconstructGroupStruct(frameKey, thisFrame);
        },
        { bypassCache: true }
    );
};

/**
 * Gets triggered when an iframe makes a POST request to communicate with the Reality Editor via the object.js API
 * Also gets triggered when the settings.html (or other menus) makes a POST request
 * Modules can subscribe to these events by using realityEditor.network.addPostMessageHandler, in addition to the many
 * events already hard-coded into this method (todo: better organize these and move/distribute to the related modules)
 * @param {object|string} e - stringified or parsed event (works for either format)
 */
realityEditor.network.onInternalPostMessage = function (e) {
    var msgContent = {};

    // catch error when safari sends a misc event
    if (typeof e === 'object' && typeof e.data === 'object') {
        msgContent = e.data;
    } else if (e.data && typeof e.data !== 'object') {
        msgContent = JSON.parse(e.data);
    } else {
        msgContent = JSON.parse(e);
    }

    // iterates over all registered postMessageHandlers to trigger events in various modules
    this.postMessageHandlers.forEach(function (messageHandler) {
        if (typeof msgContent[messageHandler.messageName] !== 'undefined') {
            messageHandler.callback(msgContent[messageHandler.messageName], msgContent);
        }
    });

    if (typeof msgContent.settings !== 'undefined') {
        realityEditor.network.onSettingPostMessage(msgContent);
        return;
    }

    if (typeof msgContent.foundObjectsButton !== 'undefined') {
        realityEditor.network.onFoundObjectButtonMessage(msgContent);
        return;
    }

    if (msgContent.resendOnElementLoad) {
        var elt = document.getElementById('iframe' + msgContent.nodeKey);
        if (elt) {
            var data = elt.dataset;
            realityEditor.network.onElementLoad(data.objectKey, data.frameKey, data.nodeKey);
        }
    }

    var tempThisObject = {};
    var thisVersionNumber = msgContent.version || 0; // defaults to 0 if no version included

    if (thisVersionNumber >= 170) {
        if (!msgContent.object || !msgContent.object) return; // TODO: is this a typo? checks identical condition twice
    } else {
        if (!msgContent.obj || !msgContent.pos) return;
        msgContent.object = msgContent.obj;
        msgContent.frame = msgContent.obj;
        msgContent.node = msgContent.pos;
    }

    // var thisFrame = realityEditor.getFrame(msgContent.object, msgContent.frame);
    // var thisNode = realityEditor.getNode(msgContent.node);
    // var activeVehicle = thisNode || thisFrame;

    // var activeKey = null;

    if (msgContent.node) {
        tempThisObject = realityEditor.getNode(
            msgContent.object,
            msgContent.frame,
            msgContent.node
        );
    } else if (msgContent.frame) {
        tempThisObject = realityEditor.getFrame(msgContent.object, msgContent.frame);
    } else if (msgContent.object) {
        tempThisObject = realityEditor.getObject(msgContent.object);
    }

    // make it work for pocket items too
    if (!tempThisObject && msgContent.object && msgContent.object in pocketItem) {
        if (msgContent.node && msgContent.frame) {
            tempThisObject =
                pocketItem[msgContent.object].frames[msgContent.frame].nodes[msgContent.node];
        } else if (msgContent.frame) {
            tempThisObject = pocketItem[msgContent.object].frames[msgContent.frame];
        } else {
            tempThisObject = pocketItem[msgContent.object];
        }
    }

    if (msgContent.frame && !tempThisObject) {
        console.warn(
            "The tool that sent this message doesn't exist - ignore the message",
            msgContent
        );
        return;
    }

    tempThisObject = tempThisObject || {};

    if (msgContent.width && msgContent.height) {
        let activeKey = msgContent.node ? msgContent.node : msgContent.frame;

        var overlay = document.getElementById(activeKey);
        var iFrame = document.getElementById('iframe' + activeKey);
        var svg = document.getElementById('svg' + activeKey);

        var top = (globalStates.width - msgContent.height) / 2;
        var left = (globalStates.height - msgContent.width) / 2;
        overlay.style.width = msgContent.width;
        overlay.style.height = msgContent.height;
        overlay.style.top = top;
        overlay.style.left = left;

        iFrame.style.width = msgContent.width;
        iFrame.style.height = msgContent.height;
        iFrame.style.top = top;
        iFrame.style.left = left;

        let vehicle = realityEditor.getVehicle(
            msgContent.object,
            msgContent.frame,
            msgContent.node
        );
        if (vehicle) {
            vehicle.frameSizeX = msgContent.width;
            vehicle.frameSizeY = msgContent.height;
            vehicle.width = msgContent.width;
            vehicle.height = msgContent.height;
        }

        if (svg) {
            svg.style.width = msgContent.width;
            svg.style.height = msgContent.height;

            realityEditor.gui.ar.moveabilityOverlay.createSvg(svg);
        }

        if (
            globalStates.editingMode ||
            realityEditor.device.getEditingVehicle() === tempThisObject
        ) {
            // svg.style.display = 'inline';
            // svg.classList.add('visibleEditingSVG');

            overlay.querySelector('.corners').style.visibility = 'visible';
        } else {
            // svg.style.display = 'none';
            // svg.classList.remove('visibleEditingSVG');

            overlay.querySelector('.corners').style.visibility = 'hidden';
        }
    }

    // Forward the touch events from the nodes to the overall touch event collector

    if (typeof msgContent.eventObject !== 'undefined') {
        if (msgContent.eventObject.type === 'touchstart') {
            realityEditor.device.touchInputs.screenTouchStart(msgContent.eventObject);
        } else if (msgContent.eventObject.type === 'touchend') {
            realityEditor.device.touchInputs.screenTouchEnd(msgContent.eventObject);
        } else if (msgContent.eventObject.type === 'touchmove') {
            realityEditor.device.touchInputs.screenTouchMove(msgContent.eventObject);
        }
        return;
    }

    if (typeof msgContent.screenObject !== 'undefined') {
        realityEditor.gui.screenExtension.receiveObject(msgContent.screenObject);
    }

    if (typeof msgContent.sendScreenObject !== 'undefined') {
        if (msgContent.sendScreenObject) {
            realityEditor.gui.screenExtension.registeredScreenObjects[msgContent.frame] = {
                object: msgContent.object,
                frame: msgContent.frame,
                node: msgContent.node,
            };
            realityEditor.gui.screenExtension.visibleScreenObjects[msgContent.frame] = {
                object: msgContent.object,
                frame: msgContent.frame,
                node: msgContent.node,
                x: 0,
                y: 0,
            };
        }
    }

    if (msgContent.sendMatrix === true) {
        if (tempThisObject.integerVersion >= 32) {
            tempThisObject.sendMatrix = true;
            let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
            if (activeKey === msgContent.frame) {
                // only send these into frames, not nodes
                // send the projection matrix into the iframe (e.g. for three.js to use)
                globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                    '{"projectionMatrix":' +
                        JSON.stringify(globalStates.realProjectionMatrix) +
                        '}',
                    '*'
                );
            }
        }
    }

    if (typeof msgContent.sendMatrices !== 'undefined') {
        if (msgContent.sendMatrices.model === true || msgContent.sendMatrices.view === true) {
            if (tempThisObject.integerVersion >= 32) {
                if (!tempThisObject.sendMatrices) tempThisObject.sendMatrices = {};
                tempThisObject.sendMatrices.model = msgContent.sendMatrices.model;
                tempThisObject.sendMatrices.view = msgContent.sendMatrices.view;
                let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
                if (activeKey === msgContent.frame) {
                    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                        '{"projectionMatrix":' +
                            JSON.stringify(globalStates.realProjectionMatrix) +
                            '}',
                        '*'
                    );
                }
            }
        }
        if (msgContent.sendMatrices.groundPlane === true) {
            if (tempThisObject.integerVersion >= 32) {
                if (!tempThisObject.sendMatrices) tempThisObject.sendMatrices = {};
                tempThisObject.sendMatrices.groundPlane = true;
                let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
                if (activeKey === msgContent.frame) {
                    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                        '{"projectionMatrix":' +
                            JSON.stringify(globalStates.realProjectionMatrix) +
                            '}',
                        '*'
                    );
                }
            }
        }
        if (msgContent.sendMatrices.anchoredModelView === true) {
            if (tempThisObject.integerVersion >= 32) {
                if (!tempThisObject.sendMatrices) tempThisObject.sendMatrices = {};
                tempThisObject.sendMatrices.anchoredModelView = true;
                let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
                if (activeKey === msgContent.frame) {
                    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                        '{"projectionMatrix":' +
                            JSON.stringify(globalStates.realProjectionMatrix) +
                            '}',
                        '*'
                    );
                }
            }
        }
        if (msgContent.sendMatrices.devicePose === true) {
            if (tempThisObject.integerVersion >= 32) {
                if (!tempThisObject.sendMatrices) tempThisObject.sendMatrices = {};
                tempThisObject.sendMatrices.devicePose = true;
                let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
                if (activeKey === msgContent.frame) {
                    // send the projection matrix into the iframe (e.g. for three.js to use)
                    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                        '{"projectionMatrix":' +
                            JSON.stringify(globalStates.realProjectionMatrix) +
                            '}',
                        '*'
                    );
                }
            }
        }
        if (msgContent.sendMatrices.allObjects === true) {
            if (tempThisObject.integerVersion >= 32) {
                if (!tempThisObject.sendMatrices) tempThisObject.sendMatrices = {};
                tempThisObject.sendMatrices.allObjects = true;
                let activeKey = msgContent.node ? msgContent.node : msgContent.frame;
                if (activeKey === msgContent.frame) {
                    // send the projection matrix into the iframe (e.g. for three.js to use)
                    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                        '{"projectionMatrix":' +
                            JSON.stringify(globalStates.realProjectionMatrix) +
                            '}',
                        '*'
                    );
                }
            }
        }

        let isGroundPlaneVisualizerEnabled =
            realityEditor.gui.settings.toggleStates.visualizeGroundPlane;
        globalStates.useGroundPlane =
            realityEditor.gui.ar.draw.doesAnythingUseGroundPlane() ||
            isGroundPlaneVisualizerEnabled ||
            realityEditor.gui.settings.toggleStates.repositionGroundAnchors;
        realityEditor.app.callbacks.startGroundPlaneTrackerIfNeeded();
    }

    if (msgContent.sendScreenPosition === true) {
        if (tempThisObject.integerVersion >= 32) {
            tempThisObject.sendScreenPosition = true;
        }
    }

    if (msgContent.sendDeviceDistance) {
        tempThisObject.sendDeviceDistance = msgContent.sendDeviceDistance;
    }

    if (typeof msgContent.sendObjectPositions !== 'undefined') {
        tempThisObject.sendObjectPositions = msgContent.sendObjectPositions;
    }

    if (msgContent.sendAcceleration === true) {
        if (tempThisObject.integerVersion >= 32) {
            tempThisObject.sendAcceleration = true;

            if (globalStates.sendAcceleration === false) {
                globalStates.sendAcceleration = true;
                if (window.DeviceMotionEvent) {
                    window.addEventListener('deviceorientation', function () {});

                    window.addEventListener(
                        'devicemotion',
                        function (event) {
                            var thisState = globalStates.acceleration;

                            thisState.x = event.acceleration.x;
                            thisState.y = event.acceleration.y;
                            thisState.z = event.acceleration.z;

                            thisState.alpha = event.rotationRate.alpha;
                            thisState.beta = event.rotationRate.beta;
                            thisState.gamma = event.rotationRate.gamma;

                            // Manhattan Distance :-D
                            thisState.motion =
                                Math.abs(thisState.x) +
                                Math.abs(thisState.y) +
                                Math.abs(thisState.z) +
                                Math.abs(thisState.alpha) +
                                Math.abs(thisState.beta) +
                                Math.abs(thisState.gamma);
                        },
                        false
                    );
                }
            }
        }
    }

    if (msgContent.globalMessage) {
        var iframes = document.getElementsByTagName('iframe');
        for (let i = 0; i < iframes.length; i++) {
            if (
                iframes[i].id !== 'iframe' + msgContent.node &&
                iframes[i].style.visibility !== 'hidden'
            ) {
                var objectKey = iframes[i].getAttribute('data-object-key');
                if (objectKey) {
                    var receivingObject =
                        objectKey === 'pocket' ? pocketItem[objectKey] : objects[objectKey];
                    if (receivingObject.integerVersion >= 32) {
                        var msg = {};
                        if (receivingObject.integerVersion >= 170) {
                            msg = { globalMessage: msgContent.globalMessage };
                        } else {
                            msg = { ohGlobalMessage: msgContent.ohGlobalMessage };
                        }
                        iframes[i].contentWindow.postMessage(JSON.stringify(msg), '*');
                    }
                }
            }
        }
    }

    if (msgContent.sendMessageToFrame) {
        var iframe = globalDOMCache['iframe' + msgContent.sendMessageToFrame.destinationFrame];
        if (iframe) {
            iframe.contentWindow.postMessage(JSON.stringify(msgContent), '*');
        }

        // var iframes = document.getElementsByTagName('iframe');
        // for (var i = 0; i < iframes.length; i++) {
        //
        //     if (iframes[i].id !== "iframe" + msgContent.node && iframes[i].style.visibility !== "hidden") {
        //         var objectKey = iframes[i].getAttribute("data-object-key");
        //         if (objectKey) {
        //             var receivingObject = (objectKey === 'pocket') ? (pocketItem[objectKey]) : objects[objectKey];
        //             if (receivingObject.integerVersion >= 32) {
        //                 var msg = {};
        //                 if (receivingObject.integerVersion >= 170) {
        //                     msg = {globalMessage: msgContent.globalMessage};
        //                 } else {
        //                     msg = {ohGlobalMessage: msgContent.ohGlobalMessage};
        //                 }
        //                 iframes[i].contentWindow.postMessage(JSON.stringify(msg), "*");
        //             }
        //         }
        //     }
        // }
    }

    if (typeof msgContent.alwaysFaceCamera === 'boolean') {
        tempThisObject.alwaysFaceCamera = msgContent.alwaysFaceCamera;
    }

    if (typeof msgContent.fullScreen === 'boolean') {
        if (msgContent.fullScreen === true) {
            tempThisObject.fullScreen = true;

            if (msgContent.fullscreenZPosition) {
                tempThisObject.fullscreenZPosition = msgContent.fullscreenZPosition;
            }

            let zIndex = tempThisObject.fullscreenZPosition || globalStates.defaultFullscreenFrameZ; // defaults to background

            document.getElementById('object' + msgContent.frame).style.transform =
                'matrix3d(1, 0, 0, 0,' + '0, 1, 0, 0,' + '0, 0, 1, 0,' + '0, 0, ' + zIndex + ', 1)';

            globalDOMCache[tempThisObject.uuid].dataset.leftBeforeFullscreen =
                globalDOMCache[tempThisObject.uuid].style.left;
            globalDOMCache[tempThisObject.uuid].dataset.topBeforeFullscreen =
                globalDOMCache[tempThisObject.uuid].style.top;

            globalDOMCache[tempThisObject.uuid].style.opacity = '0'; // svg overlay still exists so we can reposition, but invisible
            globalDOMCache[tempThisObject.uuid].style.left = '0';
            globalDOMCache[tempThisObject.uuid].style.top = '0';

            globalDOMCache['iframe' + tempThisObject.uuid].dataset.leftBeforeFullscreen =
                globalDOMCache['iframe' + tempThisObject.uuid].style.left;
            globalDOMCache['iframe' + tempThisObject.uuid].dataset.topBeforeFullscreen =
                globalDOMCache['iframe' + tempThisObject.uuid].style.top;

            globalDOMCache['iframe' + tempThisObject.uuid].style.left = '0';
            globalDOMCache['iframe' + tempThisObject.uuid].style.top = '0';
            globalDOMCache['iframe' + tempThisObject.uuid].style.margin = '-2px';

            globalDOMCache['iframe' + tempThisObject.uuid].classList.add('webGlFrame');

            globalDOMCache['object' + tempThisObject.uuid].style.zIndex = zIndex;

            if (realityEditor.device.editingState.frame === msgContent.frame) {
                realityEditor.device.resetEditingState();
                realityEditor.device.clearTouchTimer();
            }

            // check if this requiresExclusive, and there is already an exclusive one, then kick that out of fullscreen
            if (tempThisObject.isFullScreenExclusive) {
                realityEditor.gui.ar.draw.ensureOnlyCurrentFullscreen(
                    msgContent.object,
                    msgContent.frame
                );
            }
        }
        if (msgContent.fullScreen === false) {
            if (!msgContent.node) {
                // ignore messages from nodes of this frame
                realityEditor.gui.ar.draw.removeFullscreenFromFrame(
                    msgContent.object,
                    msgContent.frame,
                    msgContent.fullScreenAnimated
                );
                realityEditor.envelopeManager.hideBlurredBackground(msgContent.frame);
            }
        }

        // update containsStickyFrame property on object whenever this changes, so that we dont have to recompute every frame
        let object = realityEditor.getObject(msgContent.object);
        if (object) {
            object.containsStickyFrame = realityEditor.gui.ar.draw.doesObjectContainStickyFrame(
                msgContent.object
            );
        }
    } else if (typeof msgContent.fullScreen === 'string') {
        if (msgContent.fullScreen === 'sticky') {
            tempThisObject.fullScreen = 'sticky';

            if (msgContent.fullscreenZPosition) {
                tempThisObject.fullscreenZPosition = msgContent.fullscreenZPosition;
            }

            // z-index can be specified. if not, goes to background if not full2D, foreground if full2D
            let zIndex =
                tempThisObject.fullscreenZPosition ||
                msgContent.fullScreenFull2D ||
                tempThisObject.isFullScreenFull2D
                    ? globalStates.defaultFullscreenFull2DFrameZ
                    : globalStates.defaultFullscreenFrameZ;

            if (typeof msgContent.fullScreenAnimated !== 'undefined') {
                const parentDiv = globalDOMCache['object' + msgContent.frame];
                let tempAnimDiv = document.createElement('div');
                tempAnimDiv.classList.add('temp-anim-div');
                tempAnimDiv.style.transform =
                    globalDOMCache['object' + msgContent.frame].style.transform;
                tempAnimDiv.style.width =
                    globalDOMCache['object' + msgContent.frame].childNodes[0].style.width;
                tempAnimDiv.style.height =
                    globalDOMCache['object' + msgContent.frame].childNodes[0].style.height;
                tempAnimDiv.style.top =
                    globalDOMCache['object' + msgContent.frame].childNodes[0].style.top;
                tempAnimDiv.style.left =
                    globalDOMCache['object' + msgContent.frame].childNodes[0].style.left;
                document.getElementById('GUI').appendChild(tempAnimDiv);
                setTimeout(() => {
                    // To obtain this hard-coded matrix3d(), I added a tool, closed it to reveal the icon, and moved the camera towards the tool,
                    // so that it almost fills up the screen in the center. And then I get the matrix3d of the object that the tool is attached to.
                    // Very hacky, hope to make it procedural in the future
                    tempAnimDiv.style.transform =
                        'matrix3d(643.374, -0.373505, 0.000212662, 0.000212647, 0.372554, 643.38, 0.000554764, 0.000554727, -2.77404, 4.28636, 0.500033, 0.5, -1406.67, 2173.54, 34481.6, 253.541)';
                    tempAnimDiv.style.top = '0';
                    tempAnimDiv.style.left = '0';
                    tempAnimDiv.style.width = parentDiv.style.width;
                    tempAnimDiv.style.height = parentDiv.style.height;
                    tempAnimDiv.classList.add('temp-anim-div-anim');
                    setTimeout(() => {
                        tempAnimDiv.parentElement.removeChild(tempAnimDiv);
                    }, 500);
                }, 10);
            }

            if (typeof msgContent.fullScreenFull2D !== 'undefined') {
                if (msgContent.fullScreenFull2D) {
                    tempThisObject.isFullScreenFull2D = true; // if "sticky" fullscreen, gets called multiple times, so need to store in the frame
                    realityEditor.envelopeManager.showBlurredBackground(msgContent.frame);
                } else {
                    tempThisObject.isFullScreenFull2D = false;
                    realityEditor.envelopeManager.hideBlurredBackground(msgContent.frame);
                }
            }

            // make the div invisible while it switches to fullscreen mode, so we don't see a jump in content vs mode
            document
                .getElementById('object' + msgContent.frame)
                .classList.add('transitioningToFullscreen');
            setTimeout(function () {
                document
                    .getElementById('object' + msgContent.frame)
                    .classList.remove('transitioningToFullscreen');
            }, 200);

            document.getElementById('object' + msgContent.frame).style.transform =
                'matrix3d(1, 0, 0, 0,' + '0, 1, 0, 0,' + '0, 0, 1, 0,' + '0, 0, ' + zIndex + ', 1)';

            globalDOMCache[tempThisObject.uuid].dataset.leftBeforeFullscreen =
                globalDOMCache[tempThisObject.uuid].style.left;
            globalDOMCache[tempThisObject.uuid].dataset.topBeforeFullscreen =
                globalDOMCache[tempThisObject.uuid].style.top;

            globalDOMCache[tempThisObject.uuid].style.opacity = '0';
            globalDOMCache[tempThisObject.uuid].style.left = '0';
            globalDOMCache[tempThisObject.uuid].style.top = '0';

            globalDOMCache['iframe' + tempThisObject.uuid].dataset.leftBeforeFullscreen =
                globalDOMCache['iframe' + tempThisObject.uuid].style.left;
            globalDOMCache['iframe' + tempThisObject.uuid].dataset.topBeforeFullscreen =
                globalDOMCache['iframe' + tempThisObject.uuid].style.top;

            globalDOMCache['iframe' + tempThisObject.uuid].style.left = '0';
            globalDOMCache['iframe' + tempThisObject.uuid].style.top = '0';
            globalDOMCache['iframe' + tempThisObject.uuid].style.margin = '-2px';

            globalDOMCache['iframe' + tempThisObject.uuid].classList.add('webGlFrame');

            globalDOMCache['object' + tempThisObject.uuid].style.zIndex = zIndex;

            // update containsStickyFrame property on object whenever this changes, so that we dont have to recompute every frame
            let object = realityEditor.getObject(msgContent.object);
            if (object) {
                object.containsStickyFrame = true;
            }

            // check if this requiresExclusive, and there is already an exclusive one, then kick that out of fullscreen
            if (tempThisObject.isFullScreenExclusive) {
                realityEditor.gui.ar.draw.ensureOnlyCurrentFullscreen(
                    msgContent.object,
                    msgContent.frame
                );
            }
        }
    }

    if (typeof msgContent.full2D !== 'undefined') {
        if (msgContent.full2D) {
            // this is useful to make tools from external sites bigger, since we can't manually scale them while full2D is enabled
            const UPDATE_SCALE_OF_FULL2D_TOOLS = true;
            if (UPDATE_SCALE_OF_FULL2D_TOOLS) {
                let activeVehicle = realityEditor.getFrame(msgContent.object, msgContent.frame);
                realityEditor.gui.ar.positioning.setVehicleScale(activeVehicle, 3.0);
            }

            if (msgContent.showWindowTitleBar) {
                realityEditor.gui.ar.positioning.addTitleBarToTool(
                    msgContent.object,
                    msgContent.frame
                );
            } else {
                if (globalDOMCache[msgContent.frame]) {
                    globalDOMCache[msgContent.frame].classList.add('deactivatedIframeOverlay');
                }
            }
        } else {
            if (globalDOMCache[msgContent.frame]) {
                globalDOMCache[msgContent.frame].classList.remove('deactivatedIframeOverlay');
            }
        }
    }

    if (typeof msgContent.stickiness === 'boolean') {
        tempThisObject.stickiness = msgContent.stickiness;
    }

    if (typeof msgContent.isFullScreenExclusive !== 'undefined') {
        tempThisObject.isFullScreenExclusive = msgContent.isFullScreenExclusive;

        // check if this requiresExclusive, and there is already an exclusive one, then kick that out of fullscreen
        if (tempThisObject.isFullScreenExclusive) {
            realityEditor.gui.ar.draw.ensureOnlyCurrentFullscreen(
                msgContent.object,
                msgContent.frame
            );
        }
    }

    if (typeof msgContent.getIsExclusiveFullScreenOccupied !== 'undefined') {
        if (globalDOMCache['iframe' + msgContent.frame]) {
            globalDOMCache['iframe' + msgContent.frame].contentWindow.postMessage(
                JSON.stringify({
                    fullScreenOccupiedStatus:
                        realityEditor.gui.ar.draw.getAllVisibleExclusiveFrames().length > 0,
                }),
                '*'
            );
        }
    }

    if (typeof msgContent.nodeIsFullScreen !== 'undefined') {
        let nodeName = msgContent.nodeName;

        let thisNodeKey = null;
        Object.keys(tempThisObject.nodes).map(function (nodeKey) {
            if (tempThisObject.nodes[nodeKey].name === nodeName) {
                thisNodeKey = nodeKey;
            }
        });

        if (thisNodeKey) {
            this.setNodeFullScreen(
                tempThisObject.objectId,
                tempThisObject.uuid,
                nodeName,
                msgContent
            );
        } else {
            this.addPendingNodeAdjustment(
                tempThisObject.objectId,
                tempThisObject.uuid,
                nodeName,
                JSON.parse(JSON.stringify(msgContent))
            );
        }
    }

    if (typeof msgContent.moveNode !== 'undefined') {
        let thisFrame = realityEditor.getFrame(msgContent.object, msgContent.frame);

        // move each node within this frame with a matching name to the provided x,y coordinates
        Object.keys(thisFrame.nodes)
            .map(function (nodeKey) {
                return thisFrame.nodes[nodeKey];
            })
            .filter(function (node) {
                return node.name === msgContent.moveNode.name;
            })
            .forEach(function (node) {
                node.x = msgContent.moveNode.x || 0;
                node.y = msgContent.moveNode.y || 0;

                var positionData = realityEditor.gui.ar.positioning.getPositionData(node);
                var content = {};
                content.x = positionData.x;
                content.y = positionData.y;
                content.scale = positionData.scale;

                content.lastEditor = globalStates.tempUuid;
                let urlEndpoint = realityEditor.network.getURL(
                    objects[msgContent.object].ip,
                    realityEditor.network.getPort(objects[msgContent.object]),
                    '/object/' +
                        msgContent.object +
                        '/frame/' +
                        msgContent.frame +
                        '/node/' +
                        node.uuid +
                        '/nodeSize/'
                );
                realityEditor.network.postData(urlEndpoint, content);
            });
    }

    if (typeof msgContent.resetNodes !== 'undefined') {
        realityEditor.forEachNodeInFrame(
            msgContent.object,
            msgContent.frame,
            function (thisObjectKey, thisFrameKey, thisNodeKey) {
                // delete links to and from the node
                realityEditor.forEachFrameInAllObjects(function (thatObjectKey, thatFrameKey) {
                    var thatFrame = realityEditor.getFrame(thatObjectKey, thatFrameKey);
                    Object.keys(thatFrame.links).forEach(function (linkKey) {
                        var thisLink = thatFrame.links[linkKey];
                        if (
                            (thisLink.objectA === thisObjectKey &&
                                thisLink.frameA === thisFrameKey &&
                                thisLink.nodeA === thisNodeKey) ||
                            (thisLink.objectB === thisObjectKey &&
                                thisLink.frameB === thisFrameKey &&
                                thisLink.nodeB === thisNodeKey)
                        ) {
                            delete thatFrame.links[linkKey];
                            realityEditor.network.deleteLinkFromObject(
                                objects[thatObjectKey].ip,
                                thatObjectKey,
                                thatFrameKey,
                                linkKey
                            );
                        }
                    });
                });

                // remove it from the DOM
                realityEditor.gui.ar.draw.deleteNode(thisObjectKey, thisFrameKey, thisNodeKey);
                // delete it from the server
                realityEditor.network.deleteNodeFromObject(
                    objects[thisObjectKey].ip,
                    thisObjectKey,
                    thisFrameKey,
                    thisNodeKey
                );
            }
        );
    }

    if (typeof msgContent.beginTouchEditing !== 'undefined') {
        let activeKey = msgContent.node || msgContent.frame;
        var element = document.getElementById(activeKey);
        realityEditor.device.beginTouchEditing(element);
    }

    if (typeof msgContent.touchEvent !== 'undefined') {
        var event = msgContent.touchEvent;
        var target = document.getElementById(msgContent.frame);
        if (!target) {
            return;
        }
        var fakeEvent = {
            target: target,
            currentTarget: target,
            clientX: event.x,
            clientY: event.y,
            pageX: event.x,
            pageY: event.y,
            preventDefault: function () {},
        };
        if (event.type === 'touchend') {
            realityEditor.device.onDocumentPointerUp(fakeEvent);
            realityEditor.device.onMultiTouchEnd(fakeEvent);
            globalStates.tempEditingMode = false;
            globalStates.unconstrainedSnapInitialPosition = null;
            realityEditor.device.deactivateFrameMove(msgContent.frame);
            let frame = globalDOMCache['iframe' + msgContent.frame];
            if (frame && !msgContent.node) {
                frame.contentWindow.postMessage(
                    JSON.stringify({
                        stopTouchEditing: true,
                    }),
                    '*'
                );
            }
        }
    }

    if (typeof msgContent.visibilityDistance !== 'undefined') {
        let activeVehicle = realityEditor.getFrame(msgContent.object, msgContent.frame);

        activeVehicle.distanceScale = msgContent.visibilityDistance;
    }

    if (typeof msgContent.moveDelay !== 'undefined') {
        let activeVehicle = realityEditor.getFrame(msgContent.object, msgContent.frame);

        if (activeVehicle) {
            activeVehicle.moveDelay = msgContent.moveDelay;
        }
    }

    if (msgContent.loadLogicIcon) {
        this.loadLogicIcon(msgContent);
    }

    if (msgContent.loadLogicName) {
        this.loadLogicName(msgContent);
    }

    if (typeof msgContent.publicData !== 'undefined') {
        let frame = realityEditor.getFrame(msgContent.object, msgContent.frame);
        let node = realityEditor.getNode(msgContent.object, msgContent.frame, msgContent.node);

        if (frame && node) {
            if (!publicDataCache.hasOwnProperty(msgContent.frame)) {
                publicDataCache[msgContent.frame] = {};
            }
            publicDataCache[msgContent.frame][node.name] = msgContent.publicData;
            frame.publicData = msgContent.publicData;
            node.publicData = JSON.parse(JSON.stringify(msgContent.publicData));

            var TEMP_DISABLE_REALTIME_PUBLIC_DATA = true;

            if (!TEMP_DISABLE_REALTIME_PUBLIC_DATA) {
                var keys = realityEditor.getKeysFromVehicle(frame);
                realityEditor.network.realtime.broadcastUpdate(
                    keys.objectKey,
                    keys.frameKey,
                    keys.nodeKey,
                    'publicData',
                    msgContent.publicData
                );
            }
        }
    }

    if (typeof msgContent.videoRecording !== 'undefined') {
        if (msgContent.videoRecording) {
            realityEditor.device.videoRecording.startRecordingForFrame(
                msgContent.object,
                msgContent.frame
            );
        } else {
            realityEditor.device.videoRecording.stopRecordingForFrame(
                msgContent.object,
                msgContent.frame
            );
        }
    }

    if (typeof msgContent.virtualizerRecording !== 'undefined') {
        if (msgContent.virtualizerRecording) {
            realityEditor.device.videoRecording.startVirtualizerRecording((error) => {
                const thisMsg = {
                    virtualizerRecordingError: error,
                };
                globalDOMCache['iframe' + msgContent.frame].contentWindow.postMessage(
                    JSON.stringify(thisMsg),
                    '*'
                );
            });
        } else {
            realityEditor.device.videoRecording.stopVirtualizerRecording(
                (error, baseUrl, recordingId, deviceId, orientation) => {
                    const thisMsg = {
                        virtualizerRecordingData: {
                            error,
                            baseUrl,
                            recordingId,
                            deviceId,
                            orientation,
                        },
                    };
                    globalDOMCache['iframe' + msgContent.frame].contentWindow.postMessage(
                        JSON.stringify(thisMsg),
                        '*'
                    );
                }
            );
        }
    }

    if (typeof msgContent.getScreenshotBase64 !== 'undefined') {
        realityEditor.network.frameIdForScreenshot = msgContent.frame;
        realityEditor.app.getSnapshot('S', function (base64String) {
            var thisMsg = {
                getScreenshotBase64: base64String,
                // frameKey: realityEditor.network.frameIdForScreenshot
            };
            globalDOMCache[
                'iframe' + realityEditor.network.frameIdForScreenshot
            ].contentWindow.postMessage(JSON.stringify(thisMsg), '*');
        });
    }

    if (typeof msgContent.openKeyboard !== 'undefined') {
        if (msgContent.openKeyboard) {
            realityEditor.device.keyboardEvents.openKeyboard();
        } else {
            realityEditor.device.keyboardEvents.closeKeyboard();
        }
    }

    if (typeof msgContent.ignoreAllTouches !== 'undefined') {
        let frame = realityEditor.getFrame(msgContent.object, msgContent.frame);
        frame.ignoreAllTouches = msgContent.ignoreAllTouches;
    }

    if (typeof msgContent.getScreenDimensions !== 'undefined') {
        globalDOMCache['iframe' + msgContent.frame].contentWindow.postMessage(
            JSON.stringify({
                screenDimensions: {
                    width: globalStates.height,
                    height: globalStates.width,
                },
            }),
            '*'
        );
    }

    // adjusts the iframe and touch overlay size based on a message from the iframe about the size of its contents changing
    if (typeof msgContent.changeFrameSize !== 'undefined') {
        let width = msgContent.changeFrameSize.width;
        let height = msgContent.changeFrameSize.height;

        let iFrame = document.getElementById('iframe' + msgContent.frame);
        let overlay = document.getElementById(msgContent.frame);

        iFrame.style.width = width + 'px';
        iFrame.style.height = height + 'px';
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';

        let cornerPadding = 24;
        overlay.querySelector('.corners').style.width = width + cornerPadding * 2 + 'px';
        overlay.querySelector('.corners').style.height = height + cornerPadding * 2 + 'px';
    }

    // this is the API that frames can use to define which nodes they should have
    if (typeof msgContent.initNode !== 'undefined') {
        let nodeData = msgContent.initNode.nodeData;
        let nodeKey = msgContent.frame + nodeData.name;
        realityEditor.network.createNode(msgContent.object, msgContent.frame, nodeKey, nodeData);
    }

    // this is deprecated alias that can be used instead of initNode
    if (typeof msgContent.createNode !== 'undefined') {
        let nodeData = msgContent.createNode;
        let nodeKey = msgContent.frame + nodeData.name;
        realityEditor.network.createNode(msgContent.object, msgContent.frame, nodeKey, nodeData);
    }

    if (typeof msgContent.useWebGlWorker !== 'undefined') {
        realityEditor.gui.glRenderer.addWebGlProxy(msgContent.frame);
    }

    if (typeof msgContent.attachesTo !== 'undefined') {
        let attachesTo = msgContent.attachesTo;

        if (!attachesTo || !(attachesTo.length >= 1)) {
            return;
        }

        let object = realityEditor.getObject(msgContent.object);

        // check if this object is incompatible
        let shouldInclude = false;
        if (attachesTo.includes('object')) {
            shouldInclude = true;
        }
        if (attachesTo.includes('world')) {
            if (object.isWorldObject) {
                shouldInclude = true;
            }
        }
        if (shouldInclude) {
            return;
        } // compatible - no need to do anything

        let loyaltyString = attachesTo.includes('object')
            ? 'object'
            : attachesTo.includes('world')
              ? 'world'
              : null;
        realityEditor.sceneGraph.setLoyalty(
            loyaltyString,
            msgContent.object,
            msgContent.frame,
            msgContent.node
        );
    }

    if (typeof msgContent.getWorldId !== 'undefined') {
        // trigger the getWorldId callback
        realityEditor.sceneGraph.network.triggerLocalizationCallbacks(msgContent.object);
    }

    if (typeof msgContent.sendPositionInWorld !== 'undefined') {
        tempThisObject.sendPositionInWorld = true;
    }

    if (typeof msgContent.getPositionInWorld !== 'undefined') {
        let response = {};

        // check what it's best worldId should be
        let worldObjectId = realityEditor.sceneGraph.getWorldId();

        // only works if its localized against a world object
        if (worldObjectId) {
            let toolSceneNode = realityEditor.sceneGraph.getSceneNodeById(msgContent.frame); //.worldMatrix;
            let worldSceneNode = realityEditor.sceneGraph.getSceneNodeById(worldObjectId); //.worldMatrix;
            let relativeMatrix = toolSceneNode.getMatrixRelativeTo(worldSceneNode);

            response.getPositionInWorld = {
                objectId: msgContent.object,
                worldId: worldObjectId,
                worldMatrix: relativeMatrix,
            };
        } else {
            response.getPositionInWorld = {
                objectId: msgContent.object,
                worldId: null,
                worldMatrix: null,
            };
        }

        if (globalDOMCache['iframe' + msgContent.frame]) {
            globalDOMCache['iframe' + msgContent.frame].contentWindow.postMessage(
                JSON.stringify(response),
                '*'
            );
        }
    }

    if (typeof msgContent.errorNotification !== 'undefined') {
        let errorMessageText = msgContent.errorNotification;
        let messageTime = 5000;

        // create UI if needed
        let errorNotificationUI = document.getElementById('errorNotificationUI');
        if (!errorNotificationUI) {
            realityEditor.gui.modal.showBannerNotification(
                errorMessageText,
                'errorNotificationUI',
                'errorNotificationText',
                messageTime
            );
        }
    }

    if (typeof msgContent.setPinned !== 'undefined') {
        realityEditor.network.setPinned(msgContent.object, msgContent.frame, msgContent.setPinned);
    }
};

/**
 * Call this when a tool uses initNode or sendCreateNode to add a new node to the tool
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {Object} nodeData
 */
realityEditor.network.createNode = function (objectKey, frameKey, nodeKey, nodeData) {
    let frame = realityEditor.getFrame(objectKey, frameKey);
    if (!frame) return;
    if (typeof frame.nodes[nodeKey] !== 'undefined') return; // don't create the node if it already exists

    let node = new Node();
    frame.nodes[nodeKey] = node;

    node.objectId = objectKey;
    node.frameId = frameKey;
    node.name = nodeData.name;

    function getRandomPosition() {
        return realityEditor.device.utilities.randomIntInc(0, 200) - 100;
    }

    // assign properties from the nodeData, but only if they exist
    node.type = (typeof nodeData.type !== 'undefined' && nodeData.type) || node.type;
    node.x = (typeof nodeData.x !== 'undefined' && nodeData.x) || getRandomPosition();
    node.y = (typeof nodeData.y !== 'undefined' && nodeData.y) || getRandomPosition();
    node.scale =
        (typeof nodeData.scaleFactor !== 'undefined' && nodeData.scaleFactor) || node.scale;
    node.data.value =
        (typeof nodeData.defaultValue !== 'undefined' && nodeData.defaultValue) || node.data.value;

    realityEditor.sceneGraph.addNode(objectKey, frameKey, nodeKey, node);

    if (nodeData.attachToGroundPlane) {
        realityEditor.sceneGraph.attachToGroundPlane(objectKey, frameKey, nodeKey);
    }

    // post node to server
    let object = realityEditor.getObject(objectKey);
    realityEditor.network.postNewNode(object.ip, objectKey, frameKey, nodeKey, node, (response) => {
        if (!response.node) return;

        let serverNode =
            typeof response.node === 'string' ? JSON.parse(response.node) : response.node;
        for (let key in serverNode) {
            node[key] = serverNode[key]; // update local node to match server node
        }

        // trigger onNodeAddedToFrame callbacks
        let nodeAddedCallbacks = realityEditor.network.nodeAddedCallbacks;
        if (nodeAddedCallbacks[objectKey] && nodeAddedCallbacks[objectKey][frameKey]) {
            nodeAddedCallbacks[objectKey][frameKey].forEach((callback) => {
                if (typeof callback !== 'function') return;
                callback(nodeKey);
            });
        }
    });
};

// allow modules to perform an action in response to the iframe loading and spatialInterface.initNode being processed
// and the user interface posting the node to the server and the server responding with a success
realityEditor.network.onNodeAddedToFrame = function (objectKey, frameKey, callback) {
    let nodeAddedCallbacks = realityEditor.network.nodeAddedCallbacks;
    if (typeof nodeAddedCallbacks[objectKey] === 'undefined') {
        nodeAddedCallbacks[objectKey] = {};
    }
    if (typeof nodeAddedCallbacks[objectKey][frameKey] === 'undefined') {
        nodeAddedCallbacks[objectKey][frameKey] = [];
    }
    nodeAddedCallbacks[objectKey][frameKey].push(callback);
};

realityEditor.network.setNodeFullScreen = function (objectKey, frameKey, nodeName, msgContent) {
    let tempThisObject = realityEditor.getFrame(objectKey, frameKey);

    let thisNodeKey = null;
    Object.keys(tempThisObject.nodes).map(function (nodeKey) {
        if (tempThisObject.nodes[nodeKey].name === nodeName) {
            thisNodeKey = nodeKey;
        }
    });

    let isFullscreen = msgContent.nodeIsFullScreen;

    let thisNode = tempThisObject.nodes[thisNodeKey];
    if (thisNode) {
        thisNode.fullScreen = isFullscreen;

        let element = globalDOMCache[thisNodeKey];
        let iframeElement = globalDOMCache['iframe' + thisNodeKey];
        let objectElement = globalDOMCache['object' + thisNodeKey];

        if (isFullscreen) {
            // don't need to set objectElement.style.transform here because that happens in gui.ar.draw
            element.dataset.leftBeforeFullscreen = element.style.left;
            element.dataset.topBeforeFullscreen = element.style.top;
            element.style.opacity = '0'; // svg overlay still exists so we can reposition, but invisible
            element.style.left = '0';
            element.style.top = '0';

            iframeElement.dataset.leftBeforeFullscreen = iframeElement.style.left;
            iframeElement.dataset.topBeforeFullscreen = iframeElement.style.top;
            iframeElement.style.left = '0';
            iframeElement.style.top = '0';
            iframeElement.style.margin = '-2px';
        } else {
            objectElement.style.zIndex = '';

            element.style.opacity = '1';
            if (element.dataset.leftBeforeFullscreen) {
                // reset left/top offset when returns to non-fullscreen
                element.style.left = element.dataset.leftBeforeFullscreen;
            }
            if (element.dataset.topBeforeFullscreen) {
                element.style.top = element.dataset.topBeforeFullscreen;
            }

            if (iframeElement.dataset.leftBeforeFullscreen) {
                iframeElement.style.left = iframeElement.dataset.leftBeforeFullscreen;
            }
            if (iframeElement.dataset.topBeforeFullscreen) {
                iframeElement.style.top = iframeElement.dataset.topBeforeFullscreen;
            }
        }
    }
};

realityEditor.network.setPinned = function (objectKey, frameKey, isPinned) {
    let object = realityEditor.getObject(objectKey);
    let frame = realityEditor.getFrame(objectKey, frameKey);

    if (object && frame) {
        if (isPinned !== frame.pinned) {
            frame.pinned = isPinned;

            let port = realityEditor.network.getPort(object);
            var urlEndpoint = realityEditor.network.getURL(
                object.ip,
                port,
                '/object/' + objectKey + '/frame/' + frameKey + '/pinned/'
            );
            let content = {
                isPinned: isPinned,
            };
            this.postData(urlEndpoint, content, function (err, _response) {
                if (err) {
                    console.warn('error posting setPinned to ' + urlEndpoint, err);
                }
            });
        }
    }
};

realityEditor.network.getNewObjectForFrame = function (objectKey, frameKey, attachesTo) {
    let frame = realityEditor.getFrame(objectKey, frameKey);

    var possibleObjectKeys = realityEditor.network.availableFrames.getPossibleObjectsForFrame(
        frame.src
    );

    // get the closest object that is in possibleObjectKeys and attaches to
    return realityEditor.gui.ar.getClosestObject(function (objectKey) {
        if (possibleObjectKeys.indexOf(objectKey) > -1) {
            let thatObject = realityEditor.getObject(objectKey);
            let shouldIncludeThat = false;
            if (attachesTo.includes('object')) {
                shouldIncludeThat = true;
            }
            if (attachesTo.includes('world')) {
                if (thatObject.isWorldObject) {
                    shouldIncludeThat = true;
                }
            }
            if (shouldIncludeThat) {
                return true;
            }
        }
        return false;
    })[0];
};

// TODO: this is a potentially incorrect way to implement this... figure out a more generalized way to pass closure variables into app.callbacks
realityEditor.network.frameIdForScreenshot = null;

/**
 * Updates the icon of a logic node in response to UDP action message
 * @param {{object: string, frame: string, node: string, loadLogicIcon: string}} data - loadLogicIcon is either "auto", "custom", or "null"
 */
realityEditor.network.loadLogicIcon = function (data) {
    var iconImage = data.loadLogicIcon;
    var logicNode = realityEditor.getNode(data.object, data.frame, data.node);
    if (logicNode) {
        logicNode.iconImage = iconImage;
        if (typeof logicNode.nodeMemoryCustomIconSrc !== 'undefined') {
            delete logicNode.nodeMemoryCustomIconSrc;
        }
        realityEditor.gui.ar.draw.updateLogicNodeIcon(logicNode);
    }
};

/**
 * Updates the name text of a logic node in response to UDP action message
 * @param {{object: string, frame: string, node: string, loadLogicName: string}} data - loadLogicName is the new name
 */
realityEditor.network.loadLogicName = function (data) {
    var logicNode = realityEditor.getNode(data.object, data.frame, data.node);
    logicNode.name = data.loadLogicName;

    // update node text label on AR view
    globalDOMCache['iframe' + logicNode.uuid].contentWindow.postMessage(
        JSON.stringify({ renameNode: logicNode.name }),
        '*'
    );

    // // update model and view for pocket menu
    // var savedIndex = realityEditor.gui.memory.nodeMemories.getIndexOfLogic(logicNode);
    // if (savedIndex > -1) {
    //     realityEditor.gui.memory.nodeMemories.states.memories[savedIndex].name = logicNode.name;
    //     var nodeMemoryContainer = document.querySelector('.nodeMemoryBar').children[savedIndex];
    //     [].slice.call(nodeMemoryContainer.children).forEach(function(child) {
    //         if (!child.classList.contains('memoryNode') {
    //             child.innerHeight = logicNode.name;
    //         }
    //     });
    // }

    // upload name to server
    var object = realityEditor.getObject(data.object);
    this.postNewNodeName(object.ip, data.object, data.frame, data.node, logicNode.name);
};

/**
 * POST /rename to the logic node to update it on the server
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} name
 */
realityEditor.network.postNewNodeName = function (ip, objectKey, frameKey, nodeKey, name) {
    var contents = {
        nodeName: name,
        lastEditor: globalStates.tempUuid,
    };

    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/rename/'
        ),
        contents
    );
};

/**
 * When the settings menu posts up its new state to the rest of the application, refresh/update all settings
 * Also used for the settings menu to request data from the application, such as the list of Found Objects
 * @param {object} msgContent
 */
realityEditor.network.onSettingPostMessage = function (msgContent) {
    var self = document.getElementById('settingsIframe');

    /**
     * Get all the setting states
     */

    if (msgContent.settings.getSettings) {
        self.contentWindow.postMessage(
            JSON.stringify({
                getSettings: realityEditor.gui.settings.generateGetSettingsJsonMessage(),
            }),
            '*'
        );
    }

    if (msgContent.settings.getMainDynamicSettings) {
        self.contentWindow.postMessage(
            JSON.stringify({
                getMainDynamicSettings:
                    realityEditor.gui.settings.generateDynamicSettingsJsonMessage(
                        realityEditor.gui.settings.MenuPages.MAIN
                    ),
            }),
            '*'
        );
    }

    if (msgContent.settings.getDevelopDynamicSettings) {
        self.contentWindow.postMessage(
            JSON.stringify({
                getDevelopDynamicSettings:
                    realityEditor.gui.settings.generateDynamicSettingsJsonMessage(
                        realityEditor.gui.settings.MenuPages.DEVELOP
                    ),
            }),
            '*'
        );
    }

    if (msgContent.settings.getEnvironmentVariables) {
        self.contentWindow.postMessage(
            JSON.stringify({
                getEnvironmentVariables: realityEditor.device.environment.variables,
            }),
            '*'
        );
    }

    // this is used for the "Found Objects" settings menu, to request the list of all found objects to be posted back into the settings iframe
    if (msgContent.settings.getObjects) {
        var thisObjects = {};

        for (let objectKey in realityEditor.objects) {
            var thisObject = realityEditor.getObject(objectKey);

            var isInitialized =
                realityEditor.app.targetDownloader.isObjectTargetInitialized(objectKey) || // either target downloaded
                objectKey === realityEditor.worldObjects.getLocalWorldId(); // or it's the _WORLD_local

            thisObjects[objectKey] = {
                name: thisObject.name,
                ip: thisObject.ip,
                port: realityEditor.network.getPort(thisObject),
                version: thisObject.version,
                frames: {},
                initialized: isInitialized,
                isAnchor: realityEditor.gui.ar.anchors.isAnchorObject(objectKey),
                isWorld: thisObject.isWorldObject,
                isOcclusionActive: realityEditor.gui.threejsScene.isOcclusionActive(objectKey),
                isNavigable:
                    window.localStorage.getItem(`realityEditor.navmesh.${objectKey}`) != null,
            };

            if (thisObject.isWorldObject) {
                // getOrigin returns null if not seen yet, matrix if has been seen
                thisObjects[objectKey].isLocalized =
                    !!realityEditor.worldObjects.getOrigin(objectKey);
            } else if (thisObject.isAnchor) {
                // anchors are localized if their world object has been seen
                thisObjects[objectKey].isLocalized =
                    realityEditor.gui.ar.anchors.isAnchorObjectDetected(objectKey);
            }

            for (let frameKey in thisObject.frames) {
                var thisFrame = realityEditor.getFrame(objectKey, frameKey);
                if (thisFrame) {
                    thisObjects[objectKey].frames[frameKey] = {
                        name: thisFrame.name,
                        nodes: Object.keys(thisFrame.nodes).length,
                        links: Object.keys(thisFrame.links).length,
                    };
                }
            }
        }

        self.contentWindow.postMessage(JSON.stringify({ getObjects: thisObjects }), '*');
    }

    /**
     * This is where all the setters are placed for the Settings menu
     */

    // iterates over all possible settings (extendedTracking, editingMode, zoneText, ...., etc) and updates local variables and triggers side effects based on new state values
    if (msgContent.settings.setSettings) {
        // sets property value for each dynamically-added toggle
        realityEditor.gui.settings.addedToggles.forEach(function (toggle) {
            if (typeof msgContent.settings.setSettings[toggle.propertyName] !== 'undefined') {
                realityEditor.gui.settings.toggleStates[toggle.propertyName] =
                    msgContent.settings.setSettings[toggle.propertyName];
                toggle.onToggleCallback(msgContent.settings.setSettings[toggle.propertyName]);
            }

            if (
                typeof msgContent.settings.setSettings[toggle.propertyName + 'Text'] !== 'undefined'
            ) {
                toggle.onTextCallback(
                    msgContent.settings.setSettings[toggle.propertyName + 'Text']
                );
            }
        });
    }

    // can directly trigger native app APIs with message of correct format @todo: figure out if this is currently used?
    if (msgContent.settings.functionName) {
        realityEditor.app.appFunctionCall(
            msgContent.settings.functionName,
            msgContent.settings.messageBody,
            null
        );
    }
};

/**
 * function calls triggered by buttons in the settings' Found Objects menu
 * @param {object} msgContent
 */
realityEditor.network.onFoundObjectButtonMessage = function (msgContent) {
    if (msgContent.foundObjectsButton.hideSettings) {
        realityEditor.gui.settings.hideSettings();
    }

    if (msgContent.foundObjectsButton.locateObjects) {
        // split up objectKeys by ip to correctly format the whereIs information
        globalStates.spatial.whereIs = {};
        for (let objectKey in msgContent.foundObjectsButton.locateObjects) {
            let object = realityEditor.getObject(objectKey);
            if (object) {
                let ip = object.ip;
                if (typeof globalStates.spatial.whereIs[ip] === 'undefined') {
                    globalStates.spatial.whereIs[ip] = {};
                }
                globalStates.spatial.whereIs[ip][objectKey] =
                    msgContent.foundObjectsButton.locateObjects[objectKey];
            }
        }
    }

    if (msgContent.foundObjectsButton.snapAnchorToScreen) {
        let objectKey = msgContent.foundObjectsButton.snapAnchorToScreen;
        realityEditor.gui.ar.anchors.snapAnchorToScreen(objectKey);
    }
};

/**
 * Ask a specific server to respond with which objects it has
 * The server will respond with a list of json objects matching the format of discovery heartbeats
 * Array.<{id: string, ip: string, vn: number, tcs: string, zone: string}>
 *     These heartbeats are processed like any other heartbeats
 * @param {string} serverUrl - url for the reality server to download objects from, e.g. 10.10.10.20:8080
 */
realityEditor.network.discoverObjectsFromServer = function (serverUrl) {
    var prefix =
        serverUrl.indexOf('https://') === -1
            ? 'https://'
            : serverUrl.indexOf('http://') === -1
              ? 'http://'
              : '';
    var portSuffix = /(:[0-9]+)$/.test(serverUrl) ? '' : ':' + defaultHttpPort;
    var url = prefix + serverUrl + portSuffix + '/allObjects/';
    realityEditor.network.getData(
        null,
        null,
        null,
        url,
        function (_nullObj, _nullFrame, _nullNode, msg) {
            msg.forEach(function (heartbeat) {
                realityEditor.network.addHeartbeatObject(heartbeat);
            });
        }
    );
};

/**
 * Helper function to perform a DELETE request on the server
 * @param {string} url
 * @param {object} content
 */
realityEditor.network.deleteData = function (url, content) {
    var request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    var _this = this;
    request.onreadystatechange = function () {
        if (request.readyState === 4) _this.cout('It deleted!');
    };
    request.setRequestHeader('Content-type', 'application/json');
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    if (content) {
        request.send(JSON.stringify(content));
    } else {
        request.send();
    }
    this.cout('deleteData');
};

/**
 * Helper function to get the version number of the object. Defaults to 170.
 * @param {string} objectKey
 * @return {number}
 */
realityEditor.network.testVersion = function (objectKey) {
    var thisObject = realityEditor.getObject(objectKey);
    if (!thisObject) {
        return 170;
    } else {
        return thisObject.integerVersion;
    }
};

/**
 * Makes a DELETE request to the server to remove a frame from an object. Only works for global frames, not local.
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 */
realityEditor.network.deleteFrameFromObject = function (ip, objectKey, frameKey) {
    this.cout('I am deleting a frame: ' + ip);
    var frameToDelete = realityEditor.getFrame(objectKey, frameKey);
    if (frameToDelete) {
        if (frameToDelete.location !== 'global') {
            console.warn('WARNING: TRYING TO DELETE A LOCAL FRAME');
            return;
        }
    } else {
        console.warn('cant tell if local or global... frame has already been deleted on editor');
    }
    var contents = { lastEditor: globalStates.tempUuid };
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frames/' + frameKey
        ),
        contents
    );
};

/**
 * Makes a POST request to add a new frame to the object
 * @param {string} ip
 * @param {string} objectKey
 * @param {Frame} contents
 * @param {function} callback
 */
realityEditor.network.postNewFrame = function (ip, objectKey, contents, callback) {
    contents.lastEditor = globalStates.tempUuid;
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/addFrame/'
        ),
        contents,
        callback
    );
};

/**
 * Duplicates a frame on the server (except gives it a new uuid). Used in response to pulling on staticCopy frames.
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {object|undefined} contents - currently doesn't need this, can exclude or pass in empty object {}
 */
realityEditor.network.createCopyOfFrame = function (ip, objectKey, frameKey, contents) {
    contents = contents || {};
    contents.lastEditor = globalStates.tempUuid;

    var oldFrame = realityEditor.getFrame(objectKey, frameKey);

    var cachedPositionData = {
        x: oldFrame.ar.x,
        y: oldFrame.ar.y,
        scale: oldFrame.ar.scale,
        matrix: oldFrame.ar.matrix,
    };

    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frames/' + frameKey + '/copyFrame/'
        ),
        contents,
        function (err, response) {
            if (err) {
                console.warn('unable to make copy of frame ' + frameKey);
            } else {
                var responseFrame = response.frame;
                var newFrame = new Frame();
                for (let propertyKey in responseFrame) {
                    if (!responseFrame.hasOwnProperty(propertyKey)) continue;
                    newFrame[propertyKey] = responseFrame[propertyKey];
                }
                var thisObject = realityEditor.getObject(objectKey);

                // make this staticCopy so it replaces the old static copy
                newFrame.staticCopy = true;

                // copy position data directly from the old one in the editor so it is correctly placed to start (server version might have old data)
                newFrame.ar = cachedPositionData;
                thisObject.frames[response.frameId] = newFrame;
            }
        }
    );
};

/**
 * Makes a DELETE request to remove a link from the frame it is on (or object, for older versions)
 * @todo: at this point, we can probably stop supporting the non-frame versions
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} linkKey
 */
realityEditor.network.deleteLinkFromObject = function (ip, objectKey, frameKey, linkKey) {
    // generate action for all links to be reloaded after upload
    this.cout('I am deleting a link: ' + ip);

    if (this.testVersion(objectKey) > 162) {
        this.deleteData(
            realityEditor.network.getURL(
                ip,
                realityEditor.network.getPort(objects[objectKey]),
                '/object/' +
                    objectKey +
                    '/frame/' +
                    frameKey +
                    '/link/' +
                    linkKey +
                    '/editor/' +
                    globalStates.tempUuid +
                    '/deleteLink/'
            )
        );
    } else {
        this.deleteData(
            realityEditor.network.getURL(
                ip,
                realityEditor.network.getPort(objects[objectKey]),
                '/object/' + objectKey + '/link/' + linkKey
            )
        );
    }
};

/**
 * Makes a DELETE request to remove a node from the frame it is on
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 */
realityEditor.network.deleteNodeFromObject = function (ip, objectKey, frameKey, nodeKey) {
    // generate action for all links to be reloaded after upload
    this.cout('I am deleting a node: ' + ip);
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/editor/' +
                globalStates.tempUuid +
                '/deleteLogicNode/'
        )
    );
};

/**
 * Makes a DELETE request to remove a block from the logic node it is on
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} blockKey
 */
realityEditor.network.deleteBlockFromObject = function (
    ip,
    objectKey,
    frameKey,
    nodeKey,
    blockKey
) {
    // generate action for all links to be reloaded after upload
    this.cout('I am deleting a block: ' + ip);
    // /logic/*/*/block/*/
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/block/' +
                blockKey +
                '/editor/' +
                globalStates.tempUuid +
                '/deleteBlock/'
        )
    );
};

/**
 *
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} linkKey
 */
realityEditor.network.deleteBlockLinkFromObject = function (
    ip,
    objectKey,
    frameKey,
    nodeKey,
    linkKey
) {
    // generate action for all links to be reloaded after upload
    this.cout('I am deleting a block link: ' + ip);
    // /logic/*/*/link/*/
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/link/' +
                linkKey +
                '/editor/' +
                globalStates.tempUuid +
                '/deleteBlockLink/'
        )
    );
};

/**
 *
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 */
realityEditor.network.updateNodeBlocksSettingsData = function (ip, objectKey, frameKey, nodeKey) {
    var urlEndpoint = realityEditor.network.getURL(
        ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/node/' + nodeKey
    );
    this.getData(
        objectKey,
        frameKey,
        nodeKey,
        urlEndpoint,
        function (objectKey, frameKey, nodeKey, res) {
            for (var blockKey in res.blocks) {
                if (!res.blocks.hasOwnProperty(blockKey)) continue;
                if (res.blocks[blockKey].type === 'default') continue;
                // TODO: refactor using getter functions
                objects[objectKey].frames[frameKey].nodes[nodeKey].blocks[blockKey].publicData =
                    res.blocks[blockKey].publicData;
                objects[objectKey].frames[frameKey].nodes[nodeKey].blocks[blockKey].privateData =
                    res.blocks[blockKey].privateData;
            }
        }
    );
};

/**
 * Helper function to make a GET request to the server.
 * The objectKey, frameKey, and nodeKey are optional and will just be passed into the callback as additional arguments.
 * @param {string|undefined} objectKey
 * @param {string|undefined} frameKey
 * @param {string|undefined} nodeKey
 * @param {string} url
 * @param {function<string, string, string, object>} callback
 * @param {*} options
 */
realityEditor.network.getData = function (
    objectKey,
    frameKey,
    nodeKey,
    url,
    callback,
    options = { bypassCache: false }
) {
    if (!nodeKey) nodeKey = null;
    if (!frameKey) frameKey = null;
    var req = new XMLHttpRequest();
    let urlSuffix = options.bypassCache ? `?timestamp=${new Date().getTime()}` : '';
    try {
        req.open('GET', url + urlSuffix, true);
        if (options.bypassCache) {
            req.setRequestHeader('Cache-control', 'no-cache');
        }
        // Just like regular ol' XHR
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status >= 200 && req.status <= 299) {
                    // JSON.parse(req.responseText) etc.
                    if (req.responseText) {
                        callback(objectKey, frameKey, nodeKey, JSON.parse(req.responseText));
                    } else {
                        callback(objectKey, frameKey, nodeKey, req.responseText);
                    }
                } else {
                    // Handle error case
                    console.warn('could not load content for GET:' + url);
                }
            }
        };

        req.onerror = (e) => {
            console.error('realityEditor.network.getData xhr error', url, e);
        };
        req.ontimeout = (e) => {
            console.error('realityEditor.network.getData xhr timeout', url, e);
        };

        req.send();
    } catch (e) {
        this.cout('could not connect to' + url);
    }
};

/**
 * Helper function to POST data as json to url, calling callback with the JSON-encoded response data when finished
 * @param {String} url
 * @param {Object} body
 * @param {Function<Error, Object>} callback
 */
realityEditor.network.postData = function (url, body, callback) {
    var request = new XMLHttpRequest();
    var params = JSON.stringify(body);
    request.open('POST', url, true);
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }
        if (!callback) {
            return;
        }

        if (request.status >= 200 && request.status <= 299) {
            try {
                // console.log(request);
                callback(null, JSON.parse(request.responseText));
            } catch (e) {
                callback({ status: request.status, error: e, failure: true }, null);
            }
            return;
        }

        callback({ status: request.status, failure: true }, null);
    };

    request.setRequestHeader('Content-type', 'application/json');
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    request.send(params);
};

/**
 * Makes a POST request to add a new link from objectA, frameA, nodeA, to objectB, frameB, nodeB
 * Only goes through with it after checking to make sure there is no network loop
 * @param {Link} thisLink
 * @param {string|undefined} existingLinkKey - include if you want server to use this as the link key. otherwise randomly generates it.
 */
realityEditor.network.postLinkToServer = function (thisLink, existingLinkKey) {
    var thisObjectA = realityEditor.getObject(thisLink.objectA);
    var thisFrameA = realityEditor.getFrame(thisLink.objectA, thisLink.frameA);
    var thisNodeA = realityEditor.getNode(thisLink.objectA, thisLink.frameA, thisLink.nodeA);

    var thisObjectB = realityEditor.getObject(thisLink.objectB);
    var thisFrameB = realityEditor.getFrame(thisLink.objectB, thisLink.frameB);
    var thisNodeB = realityEditor.getNode(thisLink.objectB, thisLink.frameB, thisLink.nodeB);

    // if exactly one of objectA and objectB is the localWorldObject of the phone, prevent the link from being made
    var localWorldObjectKey = realityEditor.worldObjects.getLocalWorldId();
    var isBetweenLocalWorldAndOtherServer =
        (thisLink.objectA === localWorldObjectKey && thisLink.objectB !== localWorldObjectKey) ||
        (thisLink.objectA !== localWorldObjectKey && thisLink.objectB === localWorldObjectKey);

    var okForNewLink =
        this.checkForNetworkLoop(
            thisLink.objectA,
            thisLink.frameA,
            thisLink.nodeA,
            thisLink.logicA,
            thisLink.objectB,
            thisLink.frameB,
            thisLink.nodeB,
            thisLink.logicB
        ) && !isBetweenLocalWorldAndOtherServer;

    if (okForNewLink) {
        var linkKey = this.realityEditor.device.utilities.uuidTimeShort();
        if (existingLinkKey) {
            linkKey = existingLinkKey;
        }

        var namesA, namesB;
        var color = '';

        if (thisLink.logicA !== false) {
            if (thisLink.logicA === 0) color = 'BLUE';
            if (thisLink.logicA === 1) color = 'GREEN';
            if (thisLink.logicA === 2) color = 'YELLOW';
            if (thisLink.logicA === 3) color = 'RED';

            namesA = [thisObjectA.name, thisFrameA.name, thisNodeA.name + ':' + color];
        } else {
            namesA = [thisObjectA.name, thisFrameA.name, thisNodeA.name];
        }

        if (thisLink.logicB !== false) {
            if (thisLink.logicB === 0) color = 'BLUE';
            if (thisLink.logicB === 1) color = 'GREEN';
            if (thisLink.logicB === 2) color = 'YELLOW';
            if (thisLink.logicB === 3) color = 'RED';

            namesB = [thisObjectB.name, thisFrameB.name, thisNodeB.name + ':' + color];
        } else {
            namesB = [thisObjectB.name, thisFrameB.name, thisNodeB.name];
        }

        // this is for backword compatibility
        if (this.testVersion(thisLink.objectA) > 165) {
            thisFrameA.links[linkKey] = {
                objectA: thisLink.objectA,
                frameA: thisLink.frameA,
                nodeA: thisLink.nodeA,
                logicA: thisLink.logicA,
                namesA: namesA,
                objectB: thisLink.objectB,
                frameB: thisLink.frameB,
                nodeB: thisLink.nodeB,
                logicB: thisLink.logicB,
                namesB: namesB,
            };
        } else {
            thisFrameA.links[linkKey] = {
                ObjectA: thisLink.objectA,
                ObjectB: thisLink.objectB,
                locationInA: thisLink.nodeA,
                locationInB: thisLink.nodeB,
                ObjectNameA: namesA,
                ObjectNameB: namesB,
            };

            if (thisLink.logicA !== false || thisLink.logicB !== false) {
                return;
            }
        }

        // push new connection to objectA
        //todo this is a work around to not crash the server. only temporarly for testing
        //  if(globalProgram.logicA === false && globalProgram.logicB === false) {
        this.postNewLink(
            thisObjectA.ip,
            thisLink.objectA,
            thisLink.frameA,
            linkKey,
            thisFrameA.links[linkKey]
        );
        //  }
    }
};

/**
 * Subroutine that postLinkToServer calls after it has determined that there is no network loop, to actually perform the network request
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} linkKey
 * @param {Link} thisLink
 */
realityEditor.network.postNewLink = function (ip, objectKey, frameKey, linkKey, thisLink) {
    // generate action for all links to be reloaded after upload
    thisLink.lastEditor = globalStates.tempUuid;
    this.cout('sending Link');
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/link/' + linkKey + '/addLink/'
        ),
        thisLink,
        function (_err, _response) {
            // console.log(response);
        }
    );
};

/**
 * Makes a POST request to add a new node to a frame
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {Node} thisNode
 */
realityEditor.network.postNewNode = function (
    ip,
    objectKey,
    frameKey,
    nodeKey,
    thisNode,
    callback
) {
    thisNode.lastEditor = globalStates.tempUuid;
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/addNode'
        ),
        thisNode,
        function (err, response) {
            if (err) {
                console.warn('postNewNode error:', err);
            } else if (callback) {
                callback(response);
            }
        }
    );
};

/**
 * Makes a POST request to add a new crafting board link (logic block link) to the logic node
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} linkKey
 * @param {BlockLink} thisLink
 */
realityEditor.network.postNewBlockLink = function (
    ip,
    objectKey,
    frameKey,
    nodeKey,
    linkKey,
    thisLink
) {
    this.cout('sending Block Link');
    var linkMessage =
        this.realityEditor.gui.crafting.utilities.convertBlockLinkToServerFormat(thisLink);
    linkMessage.lastEditor = globalStates.tempUuid;
    // /logic/*/*/link/*/
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/link/' +
                linkKey +
                '/addBlockLink/'
        ),
        linkMessage,
        function () {}
    );
};

/**
 * Makes a POST request to add a new logic node to a frame
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {Logic} logic
 */
realityEditor.network.postNewLogicNode = function (ip, objectKey, frameKey, nodeKey, logic) {
    this.cout('sending Logic Node');
    // /logic/*/*/node/

    var simpleLogic = this.realityEditor.gui.crafting.utilities.convertLogicToServerFormat(logic);
    simpleLogic.lastEditor = globalStates.tempUuid;
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/addLogicNode/'
        ),
        simpleLogic,
        function () {}
    );
};

/**
 * Makes a POST request to move a logic block from one grid (x,y) position to another
 * @todo: update to use a PUT request in all instances where we are modifying rather than creating
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} logicKey
 * @param {string} blockKey
 * @param {{x: number, y: number}} content
 */
realityEditor.network.postNewBlockPosition = function (
    ip,
    objectKey,
    frameKey,
    logicKey,
    blockKey,
    content
) {
    // generate action for all links to be reloaded after upload
    this.cout('I am moving a block: ' + ip);
    // /logic/*/*/block/*/

    content.lastEditor = globalStates.tempUuid;
    if (typeof content.x === 'number' && typeof content.y === 'number') {
        this.postData(
            realityEditor.network.getURL(
                ip,
                realityEditor.network.getPort(objects[objectKey]),
                '/object/' +
                    objectKey +
                    '/frame/' +
                    frameKey +
                    '/node/' +
                    logicKey +
                    '/block/' +
                    blockKey +
                    '/blockPosition/'
            ),
            content,
            function () {}
        );
    }
};

/**
 * Makes a POST request to add a new logic block to a logic node
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} blockKey
 * @param {Logic} block
 */
realityEditor.network.postNewBlock = function (ip, objectKey, frameKey, nodeKey, blockKey, block) {
    this.cout('sending Block');
    // /logic/*/*/block/*/
    block.lastEditor = globalStates.tempUuid;

    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/block/' +
                blockKey +
                '/addBlock/'
        ),
        block,
        function () {}
    );
};

/**
 * Recursively check if adding the specified link would introduce a cycle in the network topology
 * @todo fully understand what's happening here and verify that this really works
 * @todo make sure this works for logic block links too
 * @param {string} objectAKey
 * @param {string} frameAKey
 * @param {string} nodeAKey
 * @param {string} logicAKey
 * @param {string} objectBKey
 * @param {string} frameBKey
 * @param {string} nodeBKey
 * @param {string} logicBKey
 * @return {boolean} - true if it's ok to add
 */
realityEditor.network.checkForNetworkLoop = function (
    objectAKey,
    frameAKey,
    nodeAKey,
    _logicAKey,
    objectBKey,
    frameBKey,
    nodeBKey,
    _logicBKey
) {
    var signalIsOk = true;
    var thisFrame = realityEditor.getFrame(objectAKey, frameAKey);
    var thisFrameLinks = thisFrame.links;

    // check if connection is with it self
    if (objectAKey === objectBKey && frameAKey === frameBKey && nodeAKey === nodeBKey) {
        signalIsOk = false;
    }

    // todo check that objects are making these checks as well for not producing overlapeses.
    // check if this connection already exists?
    if (signalIsOk) {
        for (var thisSubKey in thisFrameLinks) {
            if (
                thisFrameLinks[thisSubKey].objectA === objectAKey &&
                thisFrameLinks[thisSubKey].objectB === objectBKey &&
                thisFrameLinks[thisSubKey].frameA === frameAKey &&
                thisFrameLinks[thisSubKey].frameB === frameBKey &&
                thisFrameLinks[thisSubKey].nodeA === nodeAKey &&
                thisFrameLinks[thisSubKey].nodeB === nodeBKey
            ) {
                signalIsOk = false;
            }
        }
    }

    function searchL(objectA, frameA, nodeA, objectB, frameB, nodeB) {
        var thisFrame = realityEditor.getFrame(objectB, frameB);
        // TODO: make sure that these links dont get created in the first place - or that they get deleted / rerouted when destination frame changes
        if (!thisFrame) return;

        for (var key in thisFrame.links) {
            // this is within the frame
            // this.cout(objectB);
            var Bn = thisFrame.links[key]; // this is the link to work with
            if (nodeB === Bn.nodeA) {
                // check if
                if (nodeA === Bn.nodeB && objectA === Bn.objectB && frameA === Bn.frameB) {
                    signalIsOk = false;
                    break;
                } else {
                    searchL(objectA, frameA, nodeA, Bn.objectB, Bn.frameB, Bn.nodeB);
                }
            }
        }
    }

    // check that there is no endless loops through it self or any other connections
    if (signalIsOk) {
        searchL(objectAKey, frameAKey, nodeAKey, objectBKey, frameBKey, nodeBKey);
    }

    return signalIsOk;
};

/**
 * Debug method to reset the position of a specified frame or node.
 * Doesn't actually reset the position to origin, just refreshes the position, so you need to also manually set the position to 0,0,[] before calling this
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string|undefined} type - "ui" if resetting a frame, null/undefined if resetting a node
 */
realityEditor.network.sendResetContent = function (objectKey, frameKey, nodeKey, type) {
    var tempThisObject = {};
    if (type !== 'ui') {
        tempThisObject = realityEditor.getNode(objectKey, frameKey, nodeKey);
    } else {
        tempThisObject = realityEditor.getFrame(objectKey, frameKey);
    }

    if (!tempThisObject) {
        console.warn("Can't reset content of undefined object", objectKey, frameKey, nodeKey, type);
        return;
    }

    var positionData = realityEditor.gui.ar.positioning.getPositionData(tempThisObject);

    var content = {};
    content.x = positionData.x;
    content.y = positionData.y;
    content.scale = positionData.scale;

    if (typeof positionData.matrix === 'object') {
        content.matrix = positionData.matrix;
    }

    content.lastEditor = globalStates.tempUuid;

    if (
        typeof content.x === 'number' &&
        typeof content.y === 'number' &&
        typeof content.scale === 'number'
    ) {
        realityEditor.gui.ar.utilities.setAverageScale(objects[objectKey]);
        var urlEndpoint;
        if (type !== 'ui') {
            urlEndpoint = realityEditor.network.getURL(
                objects[objectKey].ip,
                realityEditor.network.getPort(objects[objectKey]),
                '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/nodeSize/'
            );
        } else {
            urlEndpoint = realityEditor.network.getURL(
                objects[objectKey].ip,
                realityEditor.network.getPort(objects[objectKey]),
                '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/size/'
            );
        }
        this.postData(urlEndpoint, content);
    }
};

/**
 * Makes a POST request to commit the state of the specified object to the server's git system, so that it can be reset to this point
 * @param {string} objectKey
 */
realityEditor.network.sendSaveCommit = function (objectKey) {
    var urlEndpoint = realityEditor.network.getURL(
        objects[objectKey].ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/saveCommit/'
    );
    var content = {};
    this.postData(urlEndpoint, content, function () {});
};

/**
 * Makes a POST request to reset the state of the object on the server to the last commit
 * (eventually updates the local state too, after the server resets and pings the app with an update action message)
 * @param {string} objectKey
 */
realityEditor.network.sendResetToLastCommit = function (objectKey) {
    var urlEndpoint = realityEditor.network.getURL(
        objects[objectKey].ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/resetToLastCommit/'
    );
    var content = {};
    this.postData(urlEndpoint, content, function () {});
};

realityEditor.network.toBeInitialized = {};
realityEditor.network.isFirstInitialization = function (objectKey, frameKey, nodeKey) {
    let activeKey = nodeKey || frameKey;
    if (this.toBeInitialized[activeKey]) {
        delete this.toBeInitialized[activeKey];
        return true;
    }
    return false;
};

/**
 * Gets set as the "onload" function of each frame/node iframe element.
 * When the iframe contents finish loading, update some local state that depends on its size, and
 * post a message into the frame with data including its object/frame/node keys, the GUI state, etc
 * @param objectKey
 * @param frameKey
 * @param nodeKey
 */
realityEditor.network.onElementLoad = function (objectKey, frameKey, nodeKey) {
    realityEditor.gui.ar.draw.notLoading = false;

    if (nodeKey === 'null') nodeKey = null;

    var version = 170;
    var object = realityEditor.getObject(objectKey);
    if (object) {
        version = object.integerVersion;
    }
    var frame = realityEditor.getFrame(objectKey, frameKey);
    var nodes = frame ? frame.nodes : {};

    var oldStyle = {
        obj: objectKey,
        pos: nodeKey,
        objectValues: object ? object.nodes : {},
        interface: globalStates.interface,
    };

    var simpleNodes = this.utilities.getNodesJsonForIframes(nodes);

    var newStyle = {
        object: objectKey,
        frame: frameKey,
        objectData: {},
        node: nodeKey,
        nodes: simpleNodes,
        port: realityEditor.network.getPort(object),
        interface: globalStates.interface,
        firstInitialization: realityEditor.network.isFirstInitialization(
            objectKey,
            frameKey,
            nodeKey
        ),
        parentLocation: window.location.href,
    };

    if (version < 170 && objectKey === nodeKey) {
        newStyle = oldStyle;
    }

    if (object && object.ip) {
        newStyle.objectData = {
            ip: object.ip,
            port: realityEditor.network.getPort(object),
        };
    }
    let activeKey = nodeKey || frameKey;

    // if (globalDOMCache['svg' + activeKey]) {
    //     realityEditor.gui.ar.moveabilityOverlay.createSvg(globalDOMCache['svg' + activeKey]);
    // }

    globalDOMCache['iframe' + activeKey].setAttribute('loaded', true);
    globalDOMCache['iframe' + activeKey].contentWindow.postMessage(JSON.stringify(newStyle), '*');

    if (nodeKey) {
        var node = realityEditor.getNode(objectKey, frameKey, nodeKey);
        if (node.type === 'logic') {
            realityEditor.gui.ar.draw.updateLogicNodeIcon(node);
        }

        this.processPendingNodeAdjustments(
            objectKey,
            frameKey,
            node.name,
            function (objectKey, frameKey, nodeName, msgContent) {
                if (typeof msgContent.nodeIsFullScreen !== 'undefined') {
                    realityEditor.network.setNodeFullScreen(
                        objectKey,
                        frameKey,
                        nodeName,
                        msgContent
                    ); // TODO: actually do this after onElementLoad for the node
                }
            }
        );
    }

    // adjust move-ability corner UI to match true width and height of frame contents
    if (globalDOMCache['iframe' + activeKey].clientWidth > 0) {
        // get around a bug where corners would resize to 0 for new logic nodes
        setTimeout(function () {
            realityEditor.gui.ar.positioning.updateTitleBarIfNeeded(objectKey, activeKey);
            realityEditor.gui.ar.positioning.updateMoveabilityCorners(objectKey, activeKey);
        }, 100); // resize corners after a slight delay to ensure that the frame has fully initialized with the correct size
    }

    // show the blue corners as soon as the frame loads
    if (
        realityEditor.device.editingState.frame === frameKey &&
        realityEditor.device.editingState.node === nodeKey
    ) {
        // document.getElementById('svg' + (nodeKey || frameKey)).classList.add('visibleEditingSVG');
        globalDOMCache[nodeKey || frameKey].querySelector('.corners').style.visibility = 'visible';
    }

    if (globalDOMCache['iframe' + (nodeKey || frameKey)].dataset.isReloading) {
        delete globalDOMCache['iframe' + (nodeKey || frameKey)].dataset.isReloading;
        realityEditor.network.callbackHandler.triggerCallbacks('elementReloaded', {
            objectKey: objectKey,
            frameKey: frameKey,
            nodeKey: nodeKey,
        });
    } else {
        realityEditor.network.callbackHandler.triggerCallbacks('elementLoaded', {
            objectKey: objectKey,
            frameKey: frameKey,
            nodeKey: nodeKey,
        });
    }

    // this is used so we can render a placeholder until it loads
    globalDOMCache['iframe' + (nodeKey || frameKey)].dataset.doneLoading = true;

    this.cout('on_load');
};

/**
 * Makes a POST request to add a lock to the specified node. Whether or not you are actually allowed to add the
 *   lock is determined within the server, based on the state of the node and the password and lock type you provide
 * @todo: get locks working again, this time with real security (e.g. encryption)
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {{lockPassword: string, lockType: string}} content - lockType is "full" or "half" (see documentation in device/security.js)
 */
realityEditor.network.postNewLockToNode = function (ip, objectKey, frameKey, nodeKey, content) {
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/node/' + nodeKey + '/addLock/'
        ),
        content,
        function () {}
    );
};

/**
 * Makes a DELETE request to remove a lock from the specified node, given a password to use to unlock it
 * @todo: encrypt / etc
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} password
 */
realityEditor.network.deleteLockFromNode = function (ip, objectKey, frameKey, nodeKey, password) {
    // generate action for all links to be reloaded after upload
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/node/' +
                nodeKey +
                '/password/' +
                password +
                '/deleteLock/'
        )
    );
};

/**
 * Makes a POST request to add a lock to the specified link.
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} linkKey
 * @param {{lockPassword: string, lockType: string}} content
 */
realityEditor.network.postNewLockToLink = function (ip, objectKey, frameKey, linkKey, content) {
    // generate action for all links to be reloaded after upload
    this.postData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/link/' + linkKey + '/addLock/'
        ),
        content,
        function () {}
    );
    // postData((realityEditor.network.useHTTPS ? 'https' : 'http') + '://' +ip+ ':' + httpPort+"/", content);
    //console.log('post --- ' + (realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + ip + ':' + httpPort + '/object/' + thisObjectKey + "/link/lock/" + thisLinkKey);
};

/**
 * Makes a DELETE request to remove a lock from the specific link
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} linkKey
 * @param {string} password
 */
realityEditor.network.deleteLockFromLink = function (ip, objectKey, frameKey, linkKey, password) {
    // generate action for all links to be reloaded after upload
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' +
                objectKey +
                '/frame/' +
                frameKey +
                '/link/' +
                linkKey +
                '/password/' +
                password +
                '/deleteLock/'
        )
    );
};

/**
 * Makes a POST request when a frame is pushed into a screen or pulled out into AR, to update state on server
 * (updating on server causes the in-screen version of the frame to show/hide as a response)
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} newVisualization - (either 'ar' or 'screen') the new visualization mode you want to change to
 * @param {{x: number, y: number, scale: number, matrix: Array.<number>}|null} oldVisualizationPositionData - optionally sync the other position data to the server before changing visualization modes. In practice, when we push into a screen we reset the AR frame's positionData to the origin
 */
realityEditor.network.updateFrameVisualization = function (
    ip,
    objectKey,
    frameKey,
    newVisualization,
    oldVisualizationPositionData
) {
    var urlEndpoint = realityEditor.network.getURL(
        ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/frame/' + frameKey + '/visualization/'
    );
    var content = {
        visualization: newVisualization,
        oldVisualizationPositionData: oldVisualizationPositionData,
    };
    this.postData(urlEndpoint, content, function (_err, _response) {});
};

/**
 * Makes a DELETE request to remove a frame's publicData from the server
 * (used e.g. when a frame is moved from one object to another, the old copy of its public data needs to be deleted)
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 */
realityEditor.network.deletePublicData = function (ip, objectKey, frameKey) {
    this.deleteData(
        realityEditor.network.getURL(
            ip,
            realityEditor.network.getPort(objects[objectKey]),
            '/object/' + objectKey + '/frame/' + frameKey + '/publicData'
        )
    );
};

/**
 * Makes a POST request to upload a frame's publicData to the server
 * (used e.g. when a frame is moved from one object to another, to upload public data to new object/server)
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param publicData
 */
realityEditor.network.postPublicData = function (ip, objectKey, frameKey, publicData) {
    var urlEndpoint = realityEditor.network.getURL(
        ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/frame/' + frameKey + '/publicData'
    );
    var content = {
        publicData: publicData,
        lastEditor: globalStates.tempUuid,
    };

    this.postData(urlEndpoint, content, function (_err, _response) {});
};

/**
 * Helper function to locate the iframe element associated with a certain frame, and post a message into it
 * @param {string} frameKey
 * @param {object} message - JSON data to send into the frame
 */
realityEditor.network.postMessageIntoFrame = function (frameKey, message) {
    var frame = document.getElementById('iframe' + frameKey);
    if (frame) {
        frame.contentWindow.postMessage(JSON.stringify(message), '*');
    }
};

/**
 * Makes a POST request to update groupIds on the server when a frame is added to or removed from a group
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string|null} newGroupID - either groupId or null for none
 */
realityEditor.network.updateGroupings = function (ip, objectKey, frameKey, newGroupID) {
    var urlEndpoint = realityEditor.network.getURL(
        ip,
        realityEditor.network.getPort(objects[objectKey]),
        '/object/' + objectKey + '/frame/' + frameKey + '/group/'
    );
    var content = {
        group: newGroupID,
        lastEditor: globalStates.tempUuid,
    };
    this.postData(urlEndpoint, content, function (_err, _response) {});
};

/**
 * Makes a POST request to update the (x,y,scale,matrix) position data of a frame or node on the server
 * @param {Frame|Node} activeVehicle
 * @param {boolean} ignoreMatrix - include this if you only want to update (x,y,scale) not the transformation matrix
 */
realityEditor.network.postVehiclePosition = function (activeVehicle, ignoreMatrix = false) {
    if (activeVehicle) {
        var positionData = realityEditor.gui.ar.positioning.getPositionData(activeVehicle);
        var content = {};
        content.x = positionData.x;
        content.y = positionData.y;
        content.scale = positionData.scale;
        if (!ignoreMatrix) {
            content.matrix = positionData.matrix;
        }
        content.lastEditor = globalStates.tempUuid;

        var endpointSuffix = realityEditor.isVehicleAFrame(activeVehicle) ? '/size/' : '/nodeSize/';
        var keys = realityEditor.getKeysFromVehicle(activeVehicle);
        var urlEndpoint = realityEditor.network.getURL(
            realityEditor.getObject(keys.objectKey).ip,
            realityEditor.network.getPort(realityEditor.getObject(keys.objectKey)),
            '/object/' +
                keys.objectKey +
                '/frame/' +
                keys.frameKey +
                '/node/' +
                keys.nodeKey +
                endpointSuffix
        );
        realityEditor.network.postData(urlEndpoint, content);
    }
};

/**
 * Upload the current position of an object (via its transformation matrix) relative to the
 * closest world object origin. Used for anchors.
 * @param {string} ip
 * @param {string} objectKey
 * @param {Array.<number>} matrix
 * @param {string} worldId
 */
realityEditor.network.postObjectPosition = function (ip, objectKey, matrix, worldId) {
    let port = realityEditor.network.getPort(objects[objectKey]);
    var urlEndpoint = realityEditor.network.getURL(ip, port, '/object/' + objectKey + '/matrix');
    let content = {
        matrix: matrix,
        worldId: worldId,
        lastEditor: globalStates.tempUuid,
    };
    this.postData(urlEndpoint, content, function (err, _response) {
        if (err) {
            console.warn('error posting object position to ' + urlEndpoint, err);
        }
    });
};

/**
 * Update the renderMode of the object on the server and other clients
 * @param {string} ip
 * @param {string} objectKey
 * @param {string} renderMode
 * @returns {Promise<unknown>}
 */
realityEditor.network.postObjectRenderMode = (ip, objectKey, renderMode) => {
    let object = realityEditor.getObject(objectKey);
    if (!object) return;
    let port = realityEditor.network.getPort(object);
    let urlEndpoint = realityEditor.network.getURL(ip, port, `/object/${objectKey}/renderMode`);
    let content = {
        renderMode: renderMode,
        lastEditor: globalStates.tempUuid,
    };
    return new Promise((resolve, reject) => {
        realityEditor.network.postData(urlEndpoint, content, (err, response) => {
            if (err) {
                console.warn('error posting object position to ' + urlEndpoint, err);
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};

realityEditor.network.searchAndDownloadUnpinnedFrames = function (ip, port) {
    realityEditor.network.search.searchFrames(
        ip,
        port,
        { src: 'communication' },
        function (matchingFrame) {
            let object = realityEditor.getObject(matchingFrame.objectId);
            if (!object) {
                return;
            }

            if (
                typeof object.unpinnedFrameKeys !== 'undefined' &&
                typeof object.frames[matchingFrame.uuid] === 'undefined'
            ) {
                let index = object.unpinnedFrameKeys.indexOf(matchingFrame.uuid);
                if (index > -1) {
                    object.frames[matchingFrame.uuid] = matchingFrame;
                    realityEditor.network.initializeDownloadedFrame(
                        matchingFrame.objectId,
                        matchingFrame.uuid,
                        matchingFrame
                    );

                    // it's still unpinned, but it's already downloaded so it can be removed from this list
                    object.unpinnedFrameKeys.splice(index, 1);
                }
            }
        }
    );
};
