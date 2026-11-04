(() => {
 const rows=Array.from(document.querySelectorAll('.module-item'));
 const search=document.querySelector('#module-search'), packages=document.querySelector('#package-filter'), status=document.querySelector('#status-filter');
 const tabs=Array.from(document.querySelectorAll('.tab'));let group='all';
 function filter(){
  const query=search.value.trim().toLocaleLowerCase();
  const codes=packages.value==='all'?null:new Set(packages.selectedOptions[0].dataset.codes.split(' '));let count=0;
  for(const row of rows){const show=(group==='all'||row.dataset.group===group)&&(status.value==='all'||row.dataset.status===status.value)&&(!codes||codes.has(row.dataset.code))&&row.dataset.search.toLocaleLowerCase().includes(query);row.hidden=!show;if(show)count++;}
  document.querySelector('#result-count').textContent=count+' of '+rows.length+' modules';document.querySelector('#empty-state').hidden=count!==0;
  for(const tab of tabs)tab.setAttribute('aria-pressed',String(tab.dataset.group===group));
 }
 for(const tab of tabs)tab.addEventListener('click',()=>{group=tab.dataset.group;filter();});
 search.addEventListener('input',filter);packages.addEventListener('change',filter);status.addEventListener('change',filter);
 document.querySelector('#reset-filters').addEventListener('click',()=>{group='all';search.value='';packages.value='all';status.value='all';filter();});
 for(const link of document.querySelectorAll('[data-package]'))link.addEventListener('click',()=>{group='all';search.value='';status.value='all';packages.value=link.dataset.package;filter();});
 for(const link of document.querySelectorAll('.nav-link'))link.addEventListener('click',()=>{for(const nav of document.querySelectorAll('.nav-link')){nav.classList.toggle('active',nav===link);if(nav===link)nav.setAttribute('aria-current','location');else nav.removeAttribute('aria-current');}});
 document.querySelector('.filters').hidden=false;filter();
})();
