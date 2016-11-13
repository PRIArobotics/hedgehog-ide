import Program from "./Program";
import Blob from "./Blob";
import Tree from "./Tree";
import Version from "./Version";
import WorkingTree from "./WorkingTree";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";

export default IProgramStorage;

/**
 * A program storage handles low level program management.
 * Programs can be either managed and manipulated directly with
 * a program store or in a more object oriented manner through
 * wrapper objects.
 */
interface IProgramStorage {

    /**
     * Create a new program
     *
     * @param name Name of the program
     */
    createProgram(name: string): Promise<Program>;

    /**
     * Delete a program permanently
     *
     * @param program Program which should be deleted
     */
    deleteProgram(name: string): Promise<void>;

    /**
     * Returns an array of all programs stored in the ProgramStorage
     *
     * @return List of program names
     */
    getProgramNames(): Promise<string[]>;

    /**
     * Get a program stored in the program storage
     *
     * @param name {@link Program} instance
     */
    getProgram(name: string): Promise<Program>;

    /**
     * Rename a program
     *
     * @param oldName Current name
     * @param newName New name
     */
    renameProgram(oldName: string, newName: string): Promise<void>;

    /**
     * Resets the program to a specific version
     *
     * This operation will delete all versions after the specified version.
     * (Internally it will perform a git reset operation which makes all later version inaccessible.)
     *
     * @param programName
     * @param versionId SHA of the version
     */
    resetProgram(programName: string, versionId: string): Promise<void>;


    /**
     * Get a blob object of a program (aka a file)
     *
     * @param programName
     * @param blobId SHA of the blob
     */
    getBlob(programName: string, blobId: string): Promise<Blob>;

    /**
     * Get a blob's content
     *
     * @param programName
     * @param blobId SHA of the blob
     * @param encoding Encoding of the returned data. Defaults to 'utf-8'
     */
    getBlobContent(programName: string, blobId: string, encoding?: string): Promise<string>;

    /**
     * Get a tree object of a program (aka a directory)
     *
     * @param programName
     * @param treeId SHA of the tree
     */
    getTree(programName: string, treeId: string): Promise<Tree>;

    /**
     * Get an array of all versions of a program
     *
     * @param programName
     * @returns array of the version's SHA hashes as string
     */
    getVersionIds(programName: string): Promise<string[]>;

    /**
     * Get a single version
     *
     * @param programName
     * @param versionId SHA of the version
     * @returns the requested version object
     */
    getVersion(programName: string, versionId: string): Promise<Version>;


    /**
     * Create a new version from the workingtree contents
     *
     * @param programName
     * @returns the newly created version's id
     */
    createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string>;


    /**
     * Get the workingtree for a program
     *
     * @param programName
     * @returns the working tree object
     */
    getWorkingTree(programName: string): WorkingTree;

    /**
     * Get a directory of a program's working tree
     *
     * @param programName
     * @param path full directory path
     * @returns the requested working tree directory
     */
    getWorkingTreeDirectory(programName: string, path: string): Promise<WorkingTreeDirectory>;

    /**
     * Get a file from the workingtree
     *
     * @param programName
     * @param path full file path
     * @returns the requested working tree file
     */
    getWorkingTreeFile(programName: string, path: string): Promise<WorkingTreeFile>;

    /**
     * Get the content of a working tree file
     *
     * @param programName
     * @param blobId SHA of the blob
     * @param encoding Encoding of the returned data. Defaults to 'utf-8'
     */
    getWorkingTreeFileContent(programName: string, path: string, encoding?: string): Promise<string>;

    /**
     * Create a new directory in the workingtree of a program
     *
     * @param programName
     * @param path full path for the new directory
     * @param mode Unix file system permissions as octal number
     */
    createWorkingTreeDirectory(programName: string, path: string, mode?: number): Promise<void>;

    /**
     * Create a new file in the workingtree of a program
     *
     * @param programName
     * @param path full path for the new file
     * @param content file content
     * @param encoding file encoding (default UTF-8)
     * @param mode Unix file system permissions as octal number
     */
    createOrUpdateWorkingTreeFile(programName: string, path: string, content: string, mode?: number): Promise<void>;

    /**
     * Update a file or directory in the working tree
     *
     * This method can be used for both setting the filemode and renaming it.
     *
     * @param programName
     * @param currentPath file's current path
     * @param options nessesary information for the update
     * @param options.mode new filemode
     * @param options.new new file path
     */
    updateWorkingTreeObject(programName: string,
                            currentPath: string,
                            options: {mode?: number, newPath?: string}): Promise<void>;

    /**
     * Delete a file or directory from the working tree.
     *
     * Directories will be deleted recursively.
     *
     * @param programName
     * @param objectPath path to the file or directory
     */
    deleteWorkingTreeObject(programName: string, objectPath: string): Promise<void>;

    /**
     * Reset the workingtree to the latest version
     *
     * Clears both untracked files and reset the index and tracked files.
     * @param programName
     */
    resetWorkingTree(programName: string): Promise<void>;
}
