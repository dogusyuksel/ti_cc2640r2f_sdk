const packageVersion = {
    "id": "/PackageVersion",
    "type": "string",
    "pattern": "^([0-9]{1,2}[.][0-9]{1,2}[.][0-9]{1,2})([.].*)?"
};
exports.packageVersion = packageVersion;

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
exports.coreType = coreType;

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
exports.packageInfo = packageInfo;

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
        },
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
    },
    "required": [
        "id",
        "name",
        "version",
        "type",
        "image",
        "description",
        "allowPartialDownload",
        "metadataVersion",
        "devices"
    ]
};
exports.packageSchema = packageSchema;

const packageArray = {
    "id": "/PackageArray",
    "type": "array",
    "items": {
        "$ref": "/PackageSchema"
    }
};
exports.packageArray = packageArray;

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
exports.deviceSchema = deviceSchema;

const deviceArray = {
    "id": "/DeviceArray",
    "type": "array",
    "items": {
        "$ref": "/Devices"
    }
};
exports.deviceArray = deviceArray;

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
exports.devtoolsSchema = devtoolsSchema;

const devToolsArray = {
    "id": "/DevToolsArray",
    "type": "array",
    "items": {
        "$ref": "/DevTools"
    }
};
exports.devToolsArray = devToolsArray;

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
exports.resourceContentSchema = resourceContentSchema;

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
exports.locationForDownload = locationForDownload;

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
exports.advanceField = advance;

const contentArray = {
    "id": "/ContentArray",
    "type": "array",
    "items": {
        "$ref": "/Content"
    }
};
exports.contentArray = contentArray;