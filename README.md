# Midas Web App 

It is a Single-Page App (SPA) written in standard web technologies [HTML5](http://whatwg.org/html), [SCSS](http://sass-lang.com) and [TypeScript](http://www.typescriptlang.org). It leverages the popular [Angular](https://angular.io/) framework and [Angular Material](https://material.angular.io/) for material design components.


## Getting started

1. Ensure you have the following installed in your system:

    [`git`](https://git-scm.com/downloads)

    [`npm`](https://nodejs.org/en/download/)

2. Install [angular-cli](https://github.com/angular/angular-cli) globally.
```
npm install -g @angular/cli
```

3. Clone the project locally into your system.
```
git clone https://github.com/MidasHub/Midas_UI_Commercial.git
```

4. `cd` into project root directory and make sure you are on the master branch.

5. Install the dependencies.
```
yarn install
```

6. To preview the app, run the following command and navigate to `http://localhost:4200/`.
```
ng serve
```

The application is using the development server with basic authentication by default. The credentials for the same are:
 
    Username - midas
    Password - Pass thần thánh 1 móc

**Important Note:** Please do not make any alterations to these credentials.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).


## Setting up a local server

Follow the given instructions for your operating system to setup a local server for the Midas platform.

[Windows](https://#)

[Ubuntu](https://#)

For connecting to server running elsewhere update the base API URL and/or tenant identifier property in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

By default OAuth2 is disabled. To enable it, change the value of oauth.enabled property to true in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

### Translate

Name: 

      - label đặt tên là lbl+[tên biến]
      - button đặt tên là btn+[tên biến]
      - message đặt lên là msg+[Tên biến]

### Alert standard
Use "Alert Interface" for popup Alert Msg
````
  Alert {
    type?: string; 
    message: string;
    msgClass?: string; --> user for string value: cssSuccess, cssInfo, cssDanger, cssWarning
    msgDuration?: number --> default: 3000ms
    hPosition?: any ; --> default: left
    vPosition?: any;--> default: top
    }
````

### Auto deployment pipeline with Github Actions
  - **Step 1:** Make a github runner as mentioned here : https://docs.github.com/en/free-pro-team@latest/actions/hosting-your-own-runners/adding-self-hosted-runners
  - **Step 2:** make a deployment YML file in .github/workflows directory of the project.
      Example: *the deployment YML file for clone source code, install dependencies and build Angular 9 project to path: /usr/share/nginx/html/staging/*
      ```
          on:
            push:
              branches: [ staging, master]   

          name: Midas_UI_staging_deploy

          jobs:
            deployStaging:
              if: ${{ github.event_name == 'push' && github.event.ref =='refs/heads/staging' }}
              runs-on: self-hosted
              steps:
              # checkout branch
              - name: pull source from staging branch
                run: |
                  git pull origin staging
              - name: install dependency
                run: |
                  yarn install
              - name: build production
                run: |
                  ng build --prod --output-hashing=all --base-href="/"  --serviceWorker=true --deleteOutputPath=true --outputPath="/usr/share/nginx/html/staging/" 
      ```
  - **Step 3:** Submit the deployment YML file to Github and done

### Update to Angular 10: (For Study online - Currently our project is version 10)
Now, we can only upgrade to Angular 10 due to incompatible dependencies: @busacca/ng-pick-datetime, ng2-smart-table  and @stomp/ng2-stompjs only supported angular 10
To upgrade to Angular 10 do as following:
  - **Step 1:** Upgrade Angular core: ng update @angular/core@10 @angular/cli@10
  - **Step 2:** Upgrade Angular material: ng update @angular/material@10 --force
  - **Step 3:** Upgrade Angular flex Layput: ng update @angular/flex-layout@10.0.0-beta.32
  - **Step 4:** Upgrade dependencies: yarn add @akveo/ng2-completer@9.0.1 @angular/fire@6.0.4 @busacca/ng-pick-datetime@10.0.0 @ngx-translate/core@13.0.0 @ngx-translate/http-loader@6.0.0 ngx-mask@10.0.4 ngx-mat-select-search@3.2.0 ngx-pagination@5.0.0 @fortawesome/angular-fontawesome@0.7.0 @fortawesome/fontawesome-svg-core@1.2.35 @fortawesome/free-solid-svg-icons@5.15.3 @ckeditor/ckeditor5-build-classic@27.0.0 @ckeditor/ckeditor5-angular @ckeditor/ckeditor5-angular@2.0.1
  - **Step 5:** Upgrade dev dependencies: yarn add codelyzer@6.0.1
**Next**: find another lib to replace @busacca/ng-pick-datetime, ng2-smart-table  and @stomp/ng2-stompjs for Angular 11 upgrading
    
### Fix firebase SDK " export '__spreadArray' was not found in 'tslib' " error
  - To Fix typo error of Firebase lib. Use VScode find function to find string "__spreadArray" in "./node_module/@firebase" and replace by "__spreadArrays"

### Set max RAM for ng serve if needed ##

node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng serve --prod  

