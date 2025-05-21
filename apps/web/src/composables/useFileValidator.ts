import { ref } from "vue";

// Schema interfaces for JSON validation
export interface JsonSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
}

export interface JsonSchema {
  type: "object" | "array";
  required?: string[];
  properties?: Record<string, JsonSchemaProperty>;
}

export const useFileValidator = () => {
  const validationError = ref<string | null>(null);

  const validateJsonFile = async (
    file: File,
    maxFileSize: number = 50 * 1024 * 1024,
    schema?: JsonSchema
  ): Promise<{
    isValid: boolean;
    errorTitle: string;
    errorMessage: string;
  }> => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".json")) {
      return {
        isValid: false,
        errorTitle: "文件类型错误",
        errorMessage: "请上传.json格式的文件",
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        errorTitle: "文件过大",
        errorMessage: `文件大小不能超过${maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Parse and validate JSON content
    try {
      const content = await readFileAsText(file);
      const jsonData = JSON.parse(content);

      // If a schema is provided, validate against it
      if (schema) {
        const isValidStructure = validateJsonStructure(jsonData, schema);
        if (!isValidStructure) {
          return {
            isValid: false,
            errorTitle: "JSON结构错误",
            errorMessage: "JSON文件结构不符合要求",
          };
        }
      }

      return {
        isValid: true,
        errorTitle: "",
        errorMessage: "",
      };
    } catch (error) {
      return {
        isValid: false,
        errorTitle: "无效的JSON文件",
        errorMessage: "请确保上传的文件是有效的JSON格式",
      };
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("File reading error"));
      };

      reader.readAsText(file);
    });
  };

  const validateJsonStructure = (data: any, schema: JsonSchema): boolean => {
    try {
      // Check type
      if (schema.type === "object" && typeof data !== "object") return false;
      if (schema.type === "array" && !Array.isArray(data)) return false;

      // Check required fields
      if (schema.required && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          if (!(field in data)) return false;
        }
      }

      // Check properties
      if (schema.properties && typeof schema.properties === "object") {
        for (const [key, prop] of Object.entries(schema.properties)) {
          if (key in data && prop.type) {
            const value = data[key];

            // Type validation
            if (prop.type === "string" && typeof value !== "string")
              return false;
            if (prop.type === "number" && typeof value !== "number")
              return false;
            if (prop.type === "boolean" && typeof value !== "boolean")
              return false;
            if (prop.type === "object" && typeof value !== "object")
              return false;
            if (prop.type === "array" && !Array.isArray(value)) return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Schema validation error:", error);
      return false;
    }
  };

  return {
    validateJsonFile,
    validationError,
  };
};
