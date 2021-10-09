
enum ProjectStatus {
    ACTIVE = "ACTIVE",
    DONE = "DONE",
}

type HTMLElementID = string;


class Project {
    constructor (
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
    ) {}
}

type ProjectListenerFunction = (projects: Project[]) => void;

interface AppInterface {
    render(): void
}

interface InjectProjectStateInterface {
    projectState: ProjectState
}

const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}


const InjectProjectState = (projectStateProp = 'projectState') => (
    (constructor: Function) => {
        constructor.prototype[projectStateProp] = ProjectState.getInstance();
    }
)

class State {
    
}

class ProjectState {
    private listeners: ProjectListenerFunction[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
        if (!this.instance){
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    addListener(listenerFunction: ProjectListenerFunction){
        this.listeners.push(listenerFunction);
    }

    addProject(project: Project) {
        this.projects.push(project);
        for (const listener of this.listeners) {
            listener(this.getProjects());
        }
    }

    private getProjects() {
        // Always return a new Array with am immutable Project object.
        return this.projects.map( project => Object.freeze(project) );
    }

}

 abstract class Component {
     
    protected hostElement: HTMLElement;
    protected templateElement: HTMLElement;

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID){
        
        // Verify we have the target "template" element.
        const template = <HTMLTemplateElement> document.getElementById(templateElementID);
        if (!template) {
            throw new Error(`Template ${templateElementID} ID does not exists on DOM!`);
        }

        this.templateElement = <HTMLElement> document.importNode(template.content ,true).firstElementChild;

        // Verify we have the target "host" element.
        const hostElement = document.getElementById(hostElementID);
        if (!hostElement) {
            throw new Error(`Host element ${hostElementID} ID does not exists on DOM!`);
        }
        
        this.hostElement = hostElement;
    }

    abstract renderElement(): void
}


class App implements AppInterface {

    constructor(private elements: Component[] ){}

    public render(){
        for (const element of this.elements) {
            element.renderElement();
        }
    }

}


@InjectProjectState()
// interface ProjectInputElement extends InjectProjectStateInterface;
class ProjectInputElement extends Component {
    
    private projectInputFormElement: HTMLFormElement;
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;
    declare private projectState: ProjectState;

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID){
        // Run Parent logic;
        super(templateElementID, hostElementID);

        // Get the template element content.
        this.projectInputFormElement = <HTMLFormElement>this.templateElement;

        this.titleInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#people');
        this.projectInputFormElement.addEventListener('submit', this.submitHandler);
    }

    private cleanForm() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event){
        event.preventDefault();
        this.getProjectInputData();
    }

    private getProjectInputData() {
        this.projectState.addProject(
            new Project(
                '_' + Math.random().toString(36).substr(2, 9), 
                this.titleInputElement.value,
                this.descriptionInputElement.value,
                +this.peopleInputElement.value,
                ProjectStatus.ACTIVE
            )
        );

        this.cleanForm();
    }

    renderElement() {
        this.projectInputFormElement.id = 'user-input';
        this.hostElement.insertAdjacentElement('afterbegin',  this.projectInputFormElement);
    }

}

@InjectProjectState()
class ProjectListElement extends Component {
    
    projectListSectionElement: HTMLElement;
    projectListElement!: HTMLUListElement;
    private listType: ProjectStatus;
    projects: Project[] = [] 
    declare private projectState: ProjectState;

    constructor(
        templateElementID: HTMLElementID, hostElementID: HTMLElementID, listType: ProjectStatus){

        // Run Parent logic;
        super(templateElementID, hostElementID);

        // Get the template element content.
        this.projectListSectionElement = <HTMLElement>this.templateElement;
        this.listType = listType;
        
        // Register a "listener" callback function that gets the most updated project State
        this.projectState.addListener(this.projectsStateListener);

    }

    @Autobind
    projectsStateListener(projects: Project[]) {
        this.projects = projects.filter(project => project.status === this.listType);
        this.renderProjects();
    }

    private renderProjects() {
        const listElement = <HTMLUListElement> document.getElementById(this.projectListElement.id);
        console.log(this.projects);
        console.log(this.projects.length);
        listElement.innerHTML = "";
        for (const project of this.projects) {
            const listItemElement = document.createElement('li');
            listItemElement.textContent = project.title;
            listElement.appendChild(listItemElement);
        }
    }

    renderElement() {
        // Append the cloned template content into the host element.
        this.projectListSectionElement.id = `${this.listType.toLocaleLowerCase()}-projects`;
        this.hostElement.insertAdjacentElement('beforeend', this.projectListSectionElement);
        this.projectListElement = this.projectListSectionElement.querySelector('ul')!;
        this.projectListElement.id = `${this.listType.toLocaleLowerCase()}-projects-list`;
        this.projectListSectionElement.querySelector('h2')!.textContent = this.listType + ' projects';
    }

}

const app = new App([
    new ProjectInputElement('project-input','app'),
    new ProjectListElement('project-list','app', ProjectStatus.ACTIVE),
    new ProjectListElement('project-list','app', ProjectStatus.DONE),
]);

app.render();