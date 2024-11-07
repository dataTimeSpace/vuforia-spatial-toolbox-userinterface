import { describe, test, expect, beforeEach } from "vitest";
import { Tag, TagCategory, TagSystem } from "./TagSystem.js";

describe("Tag", () => {
    let tag;

    beforeEach(() => {
        tag = new Tag("TestTag");
    });

    test("should create a tag with default colors", () => {
        expect(tag.name).toBe("TestTag");
        expect(tag.colors.text).toBe("#FFFFFF");
        expect(tag.colors.background).toBe("#000000");
    });

    test("should correctly serialize tag data", () => {
        const serialized = tag.serialize();
        expect(serialized).toEqual({
            name: "TestTag",
            colors: {
                text: "#FFFFFF",
                background: "#000000",
            },
        });
    });

    test("should correctly deserialize tag data", () => {
        const data = {
            name: "DeserializedTag",
            colors: {
                text: "#FF0000",
                background: "#00FF00",
            },
        };
        tag.deserialize(data);
        expect(tag.name).toBe("DeserializedTag");
        expect(tag.colors.text).toBe("#FF0000");
        expect(tag.colors.background).toBe("#00FF00");
    });
});

describe("TagCategory", () => {
    let category;
    let tag1;
    let tag2;

    beforeEach(() => {
        category = new TagCategory("TestCategory");
        tag1 = new Tag("Tag1");
        tag2 = new Tag("Tag2");
    });

    test("should create an empty category", () => {
        expect(category.name).toBe("TestCategory");
        expect(category.tags).toHaveLength(0);
    });

    test("should add tags to category", () => {
        category.addTag(tag1).addTag(tag2);
        expect(category.tags).toHaveLength(2);
        expect(category.tags).toContain(tag1);
        expect(category.tags).toContain(tag2);
    });

    test("should remove tags from category", () => {
        category.addTag(tag1).addTag(tag2);
        category.removeTag(tag1);
        expect(category.tags).toHaveLength(1);
        expect(category.tags).not.toContain(tag1);
        expect(category.tags).toContain(tag2);
    });

    test("should correctly serialize category data", () => {
        category.addTag(tag1);
        const serialized = category.serialize();
        expect(serialized).toEqual({
            name: "TestCategory",
            tags: [tag1.serialize()],
        });
    });

    test("should correctly deserialize category data", () => {
        const data = {
            name: "DeserializedCategory",
            tags: [
                {
                    name: "DeserializedTag",
                    colors: {
                        text: "#FF0000",
                        background: "#00FF00",
                    },
                },
            ],
        };
        category.deserialize(data);
        expect(category.name).toBe("DeserializedCategory");
        expect(category.tags).toHaveLength(1);
        expect(category.tags[0].name).toBe("DeserializedTag");
    });
});

describe("TagSystem", () => {
    let tagSystem;
    let category1;
    let category2;

    beforeEach(() => {
        tagSystem = new TagSystem();
        category1 = new TagCategory("Category1");
        category2 = new TagCategory("Category2");
    });

    test("should create an empty tag system", () => {
        expect(tagSystem.categories).toHaveLength(0);
    });

    test("should add categories", () => {
        tagSystem.addCategory(category1).addCategory(category2);
        expect(tagSystem.categories).toHaveLength(2);
        expect(tagSystem.categories[0].name).toBe("Category1");
        expect(tagSystem.categories[1].name).toBe("Category2");
    });

    test("should not add duplicate categories", () => {
        const duplicateCategory = new TagCategory("Category1");
        tagSystem.addCategory(category1).addCategory(duplicateCategory);
        expect(tagSystem.categories).toHaveLength(1);
    });

    test("should remove categories", () => {
        // Add categories first
        tagSystem.addCategory(category1).addCategory(category2);
        expect(tagSystem.categories).toHaveLength(2);

        // Remove a category
        tagSystem.removeCategory(category1);
        expect(tagSystem.categories).toHaveLength(1);
        expect(tagSystem.categories).not.toContain(category1);
        expect(tagSystem.categories).toContain(category2);

        // Remove another category
        tagSystem.removeCategory(category2);
        expect(tagSystem.categories).toHaveLength(0);
    });

    test("should handle removing non-existent categories", () => {
        // Add one category
        tagSystem.addCategory(category1);
        expect(tagSystem.categories).toHaveLength(1);

        // Try to remove a category that isn't in the system
        const nonExistentCategory = new TagCategory("NonExistent");
        tagSystem.removeCategory(nonExistentCategory);

        // Verify the original category is still there
        expect(tagSystem.categories).toHaveLength(1);
        expect(tagSystem.categories).toContain(category1);
    });

    test("should correctly serialize tag system data", () => {
        tagSystem.addCategory(category1);
        const serialized = tagSystem.serialize();
        expect(serialized).toEqual({
            categories: [
                {
                    name: "Category1",
                    tags: [],
                },
            ],
        });
    });

    test("should correctly deserialize tag system data", () => {
        const data = {
            categories: [
                {
                    name: "DeserializedCategory",
                    tags: [
                        {
                            name: "DeserializedTag",
                            colors: {
                                text: "#FF0000",
                                background: "#00FF00",
                            },
                        },
                    ],
                },
            ],
        };
        tagSystem.deserialize(data);
        expect(tagSystem.categories).toHaveLength(1);
        expect(tagSystem.categories[0].name).toBe("DeserializedCategory");
        expect(tagSystem.categories[0].tags).toHaveLength(1);
        expect(tagSystem.categories[0].tags[0].name).toBe("DeserializedTag");
    });
});
