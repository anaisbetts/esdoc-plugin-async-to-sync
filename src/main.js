import _ from 'lodash';

export function onStart() { 
}

function getClassName(parents) {
  let decl = _.findLast(parents, (x) => x.type === 'ClassDeclaration');
  if (!decl) return '__module';
  
  return decl.id.name;
}

function syncifyDocumentation(leadingComments) {
  let ret = _.clone(leadingComments);
  
  _.each(leadingComments, (comment) => {
    let lines = comment.value.split('\n');
    lines = _.map(lines, (line) => line.replace(/Promise<([^>]+)>/, '$1'));
    comment.value = lines.join('\n');
  });
  
  return ret;
}

function collectCommentsForMethods(el, parents = []) {
  let ret = {};
  
  if (el.type === 'MethodDefinition') {
    let klass = getClassName(parents);
    
    ret[klass] = ret[klass] || {};
    ret[klass][el.key.name] = syncifyDocumentation(el.leadingComments);

    return ret;
  }
  
  if ('declaration' in el) {
    parents.push(el);
    _.merge(ret, collectCommentsForMethods(el.declaration, _.clone(parents)));

    return ret;
  }
  
  if ('body' in el) {
    parents.push(el);

    if ('length' in el.body) {
      _.each(el.body, (x) => {
        _.merge(ret, collectCommentsForMethods(x, _.clone(parents)));
      });
    } else {
      _.merge(ret, collectCommentsForMethods(el.body, _.clone(parents)));
    }
  }
  
  return ret;
}


const syncRe = /Sync$/;
function assignCommentsToSyncMethods(el, commentMap, parents = []) {
  if (el.type === 'MethodDefinition') {
    if (!el.key.name.match(syncRe)) return;
    if (el.leadingComments) return;
    
    let klass = getClassName(parents);
    let asyncName = el.key.name.replace(syncRe, '');
    
    let asyncComments = commentMap[klass][asyncName];
    if (asyncComments) { el.leadingComments = asyncComments; }

    return;
  }
  
  if ('declaration' in el) {
    parents.push(el);
    assignCommentsToSyncMethods(el.declaration, commentMap, _.clone(parents));

    return;
  }
  
  if ('body' in el) {
    parents.push(el);
    
    if ('length' in el.body) {
      _.each(el.body, (x) => assignCommentsToSyncMethods(x, commentMap, _.clone(parents)));
    } else {
      assignCommentsToSyncMethods(el.body, commentMap, _.clone(parents));
    }
  }
}

export function onHandleAST(ev) {
  let comments = collectCommentsForMethods(ev.data.ast);
  assignCommentsToSyncMethods(ev.data.ast, comments);
}
