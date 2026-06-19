"use server";

type Projeto = {
    id: string;
    title: string;
    created: Date;
    platform: string;
  };
  
type File = {
    id: string;
    filename: string;
    filesize: string;
    fileplatform: string;
    download: string;
}

export async function mergeArrays(arr1: any, arr2: any): Promise<Projeto[]> {
    const mergedMap: { [key: string]: Projeto } = {};
  
    // Helper function to merge objects
    const mergeObjects = (obj: Projeto) => {
      if (mergedMap[obj.title]) {
        if (mergedMap[obj.title].platform == "osf") {
            mergedMap[obj.title].id += `:${obj.id}`;
        } 
        if (mergedMap[obj.title].platform == "zenodo") {
            mergedMap[obj.title].id = `${obj.id}:` + mergedMap[obj.title].id;  
        }
        mergedMap[obj.title].id = mergedMap[obj.title].id.replace("::", ":");
        // Optionally, you can handle the "created" field as per your requirements.
      } else {
        
        if (obj.platform == "osf") {
            mergedMap[obj.title] = { 
                id: `${obj.id}:`,
                title: obj.title,
                created: obj.created,
                platform: obj.platform

            };    
        }
        if (obj.platform == "zenodo") {
            mergedMap[obj.title] = { 
                id: `:${obj.id}`,
                title: obj.title,
                created: obj.created,
                platform: obj.platform

            };
        }
        
      }
    };
  
    // Iterate over both arrays
    arr1.forEach(mergeObjects);
    arr2.forEach(mergeObjects);
  
    // Convert the mergedMap back to an array
    return Object.values(mergedMap);
  }


export async function mergeFilesArrays(arr1: any, arr2: any): Promise<File[]> {
    const mergedMap: { [key: string]: File } = {};
  
    // Helper function to merge objects
    const mergeObjects = (obj: File) => {
      if (mergedMap[obj.filename]) {
        mergedMap[obj.filename].download += `, ${obj.download}`;
        mergedMap[obj.filename].fileplatform += `, ${obj.fileplatform}`;
        // Optionally, you can handle the "created" field as per your requirements.
      } else {
        mergedMap[obj.filename] = {...obj};
      }
    };
  
    // Iterate over both arrays
    arr1.forEach(mergeObjects);
    arr2.forEach(mergeObjects);
  
    // Convert the mergedMap back to an array
    return Object.values(mergedMap);
}

function getFileExtension (filename: any) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
};

export async function groupByPrefix<T extends Record<string, any>>(array: T[], key: keyof T): Promise<Record<string, T[]>> {
  return array.reduce((result, currentValue) => {
    const fullKey = currentValue[key];
    const extension = getFileExtension(fullKey);
    const lastHyphenIndex = fullKey.lastIndexOf('-'); // Find the last occurrence of '-'

    // Extract the prefix before the last hyphen
    const prefix = lastHyphenIndex !== -1 ? fullKey.substring(0, lastHyphenIndex) + `.${extension}` : fullKey;

    // Initialize the group if it doesn't exist
    if (!result[prefix]) {
      result[prefix] = [];
    }

    // Push the current value to the group
    result[prefix].push(currentValue);

    

    return result;
  }, {} as Record<string, T[]>);
}

export async function organizeFilesListInArrayDownloads(filesByGroupList: { [key: string]: any } ) {
  let output: any = [];

  Object.keys(filesByGroupList).forEach(key => {
      
      let itemOutput: {
          filename: string,
          filesize: number, 
          platform: string,
          download: {
              opcao1: string[],
              opcao2: string[]
          }
      } = {
          filename: key,
          filesize: 0,
          platform: "",
          download: { opcao1: [], opcao2: []}
      };
  
      for (let kAtt of filesByGroupList[key]) {
          if (itemOutput.platform.length == 0) {
              itemOutput.platform = kAtt.fileplatform;
          }
          itemOutput.filesize += kAtt.filesize;
          if (kAtt.fileplatform.split(",").length > 1) {
              itemOutput.download.opcao1.push(kAtt.download.split(",")[0]);
              itemOutput.download.opcao2.push(kAtt.download.split(",")[1]);
          } 
          else if (kAtt.fileplatform.split(",").length == 1) {
              itemOutput.download.opcao1.push(kAtt.download.split(",")[0]);
          } 
          
      }
  
      output.push(itemOutput);
  });
  
  return output;
}


export async function removeDuplicatesByMultipleKeys<T>(list: T[], keys: (keyof T)[]) {
  const seen = new Set();
  return list.filter((item) => {
    const compositeKey = keys.map((key) => item[key]).join("|");
    if (seen.has(compositeKey)) {
      return false;
    }
    seen.add(compositeKey);
    return true;
  });
}