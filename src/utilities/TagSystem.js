export class Tag {
    constructor(tagName) {
        this.name = tagName;
        this.colors = {
            text: '#FFFFFF',
            background: '#000000',
        };
    }

    serialize() {
        return {
            name: this.name,
            colors: {
                text: this.colors.text,
                background: this.colors.background,
            },
        };
    }

    deserialize(jsonObject) {
        this.name = jsonObject.name;
        this.colors = {
            text: jsonObject.colors.text,
            background: jsonObject.colors.background,
        };
        return this;
    }
}

export class TagCategory {
    constructor(categoryName) {
        this.name = categoryName;
        this.tags = [];
    }

    addTag(tag) {
        if (this.tags.some((existingTag) => existingTag.name === tag.name)) {
            return this;
        }
        this.tags.push(tag);
        return this;
    }

    removeTag(tag) {
        if (this.tags.includes(tag)) {
            this.tags.splice(this.tags.indexOf(tag), 1);
        }
        return this;
    }

    serialize() {
        return {
            name: this.name,
            tags: this.tags.map((tag) => tag.serialize()),
        };
    }

    deserialize(jsonObject) {
        this.name = jsonObject.name;
        this.tags = [];
        for (const jsonTag of jsonObject.tags) {
            this.addTag(new Tag().deserialize(jsonTag));
        }
        return this;
    }
}

export class TagSystem {
    constructor() {
        this.categories = [];
    }

    addCategory(category) {
        if (this.categories.some((existingCategory) => existingCategory.name === category.name)) {
            return this;
        }
        this.categories.push(category);
        return this;
    }

    removeCategory(category) {
        if (this.categories.includes(category)) {
            this.categories.splice(this.categories.indexOf(category), 1);
        }
        return this;
    }

    serialize() {
        return {
            categories: this.categories.map((category) => category.serialize()),
        };
    }

    deserialize(jsonObject) {
        this.categories = [];
        for (const jsonCategory of jsonObject.categories) {
            this.addCategory(new TagCategory().deserialize(jsonCategory));
        }
        return this;
    }
}
