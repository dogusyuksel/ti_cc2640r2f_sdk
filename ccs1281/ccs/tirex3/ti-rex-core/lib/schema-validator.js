'use strict';
const jsonValidator = require('jsonschema').Validator;
const validator = new jsonValidator();

const SchemaType = {
    PACKAGE_TIREX_JSON: 'package.tirex.json',
    CONTENT_TIREX_JSON: 'content.tirex.json',
    DEVICES_TIREX_JSON: 'devices.tirex.json',
    DEVTOOLS_TIREX_JSON: 'devtools.tirex.json'
}; exports.SchemaType = SchemaType;

exports.validator = function(json, type) {
    if (type === SchemaType.PACKAGE_TIREX_JSON) {
        return validatePackageTirexJson(json);
    }
    else if (type === SchemaType.CONTENT_TIREX_JSON) {
        return validateContentTirexJson(json);
    }
    else if (type === SchemaType.DEVICES_TIREX_JSON) {
        return validateDevicesTirexJson(json);
    }
    else if (type === SchemaType.DEVTOOLS_TIREX_JSON) {
        return validateDevtoolsTirexJson(json);
    }
    else {
        return [new Error(`Unknown schema type ${type}`)];
    }
};

///////////////////////////////////////////////////////////////////////////////
/// Shared
///////////////////////////////////////////////////////////////////////////////

const packageVersion = {
    "id": "/PackageVersion",
    "type": "string",
    "pattern": "^([0-9]{1,2}[.][0-9]{1,2}[.][0-9]{1,2})([.].*)?"
};

validator.addSchema(packageVersion, packageVersion.id);

///////////////////////////////////////////////////////////////////////////////
/// PACKAGE_TIREX_JSON
///////////////////////////////////////////////////////////////////////////////

const packageInfo = {
    "id": "/PackageInfo",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "version": {
            "$ref": "/PackageVersion"
        }
    },
    "required": [
        "id",
        "version"
    ]
};

const packageSchema = {
    "id": "/PackageSchema",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "version": {
            "$ref": "/PackageVersion"
        },
        "type": {
            "type": "string",
            "pattern": "^(devices|devtools|software)$"
        }
        /*
          ,
          "license": {
          "type": "string",
          "pattern": "^[^/][^:](.)*(\.[^/]+)$"
          },
          "image": {
          "type": "string",
          "pattern": "^[^/][^:](.)*(\.[^/]+)$"
          },
          "description": {
          "type": "string"
          },
          "allowPartialDownload": {
          "type": "string",
          "pattern": "^(true|false)$"
          },
          "devices": {
          "type": "array",
          "items": {
          "type": "string"
          }
          },
          "metadataVersion": {
          "type": "string",
          "pattern": "^([0-9][.][0-9]{1,2}[.][0-9]{1,2})$"
          },
          "supplement": {
          "$ref": "/PackageInfo"
          },
          "packageCore": {
          "type": "string"
          },
          "dependencies": {
          "$ref": "/PackageInfo"
          },
          "restrictions": {
          "type": "array",
          "items": {
          "type": "string",
          "pattern": "^(desktopOnly|desktopImportOnly)$"
          }
          }
        */
    },
    "required": [
        "id",
        "name",
        "version"
        // "type"
        // "image",
        // "description",
        // "allowPartialDownload",
        // "metadataVersion",
        // "devices"
    ]
};

const packageArray = {
    "id": "/PackageArray",
    "type": "array",
    "items": {
        "$ref": "/PackageSchema"
    }
};

validator.addSchema(packageInfo, packageInfo.id);
validator.addSchema(packageSchema, packageSchema.id);

function validatePackageTirexJson(json) {
    return validator.validate(json, packageArray).errors;
}

///////////////////////////////////////////////////////////////////////////////
/// CONTENT_TIREX_JSON
///////////////////////////////////////////////////////////////////////////////

const advance = {
    "id": "/Advance",
    "type": "object",
    "properties": {
        "overrideProjectSpecDeviceId": "boolean"
    },
    "required": [
        "overrideProjectSpecDeviceId"
    ]
};

const resourceContentSchema = {
    "id": "/Content",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "devices": {
            "type": "array",
            "item": {
                "type": "string"
            }
        },
        "devtools": {
            "type": "array",
            "item": {
                "type": "string"
            }
        },
        "coreTypes": {
            "type": "array",
            "item": {
                "type": "string"
            }
        },
        "tags": {
            "type": "array",
            "item": {
                "type": "string"
            }
        },
        "resourceType": {
            "type": "string",
            "pattern": "^(project.ccs|project.energia|project.iar|project.keil|file|file.importable|file.executable|folder|folder.importable|web.page|web.app|categoryInfo|other)$"
        },
        "fileType": {
            "type": "string",
            "pattern": "^[.][^.]+$"
        },
        "description": {
            "type": "string"
        },
        "location": {
            "type": "string",
            "pattern": "^((.+)[/]([^/]+)|(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*))$"
        },
        "categories": {
            "oneOf": [
                {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            ]
        },
        "mainCategories": {
            "oneOf": [
                {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            ]
        },
        "subCategories": {
            "oneOf": [
                {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            ]
        },
        "icon": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "ide": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(ccs|iar|keil)$"
            }
        },
        "hostOS": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(macros|linux|win)$"
            }
        },
        "targetOS": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(tirtos|freertos)$"
            }
        },
        "language": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(english|chinese)$"
            }
        },
        "license": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "compiler": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(ccs|gcc|iar)$"
            }
        },
        "locationForDownload": {
            "type": "object",
            "$ref": "/LocationForDownload"
        },
        "advance": {
            "$ref": "/Advance"
        }
    },
    "required": [
        "name",
        "resourceType",
        "location",
        "mainCategories"
    ]
};

const locationForDownload = {
    "id": "/LocationForDownload",
    "type": "object",
    "properties": {
        "macos": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "linux": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "win": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        }

    }
};

const contentArray = {
    "id": "/ContentArray",
    "type": "array",
    "items": {
        "$ref": "/Content"
    }
};

validator.addSchema(advance, advance.id);
validator.addSchema(resourceContentSchema, resourceContentSchema.id);
validator.addSchema(locationForDownload, locationForDownload.id);

function validateContentTirexJson(json) {
    return validator.validate(json, contentArray).errors;
}

///////////////////////////////////////////////////////////////////////////////
/// DEVICES_TIREX_JSON
///////////////////////////////////////////////////////////////////////////////

const coreType = {
    "id": "/CoreType",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },

    },
    "required": [
        "id",
        "name"
    ]
};

const deviceSchema = {
    "id": "/Devices",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "id": {
            "type": "string"
        },
        "type": {
            "type": "string",
            "pattern": "^(device|family|subfamily)$"
        },
        "parent": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "descriptionLocation": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "image": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "coreTypes": {
            "type": "array",
            "items": {
                "$ref": "/CoreType"
            }
        }
    },
    "required": [
        "id",
        "name",
        "type"
    ]
};

const deviceArray = {
    "id": "/DeviceArray",
    "type": "array",
    "items": {
        "$ref": "/Devices"
    }
};

validator.addSchema(coreType, coreType.id);
validator.addSchema(deviceSchema, deviceSchema.id);

function validateDevicesTirexJson(json) {
    return validator.validate(json, deviceArray).errors;
}

///////////////////////////////////////////////////////////////////////////////
/// DEVTOOLS_TIREX_JSON
///////////////////////////////////////////////////////////////////////////////

const devtoolsSchema = {
    "id": "/DevTools",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "id": {
            "type": "string"
        },
        "type": {
            "type": "string",
            "pattern": "^(board|ide|probe|programmer|utility)$"
        },
        "devices": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "description": {
            "type": "string"
        },
        "descriptionLocation": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "image": {
            "type": "string",
            "pattern": "^[^/][^:](.)*(\.[^/]+)$"
        },
        "connections": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "buyLink": {
            "type": "string",
            "pattern": "^(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$"
        },
        "toolsPage": {
            "type": "string",
            "pattern": "^(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$"
        }
    },
    "required": [
        "id",
        "name",
        "type",
        "description",
        "image"
    ]
};

const devToolsArray = {
    "id": "/DevToolsArray",
    "type": "array",
    "items": {
        "$ref": "/DevTools"
    }
};

validator.addSchema(devtoolsSchema, devtoolsSchema.id);

function validateDevtoolsTirexJson(json) {
    return validator.validate(json, devToolsArray).errors;
}
