import dynamic from 'next/dynamic'


const DynamicComponentWithNoSSR = dynamic(() => import('./TypedForm'), {
  ssr: false
})
type MainFormProps = {
  defaultData?: any;
  typeName: string;
  classIRI: string;
};

// @ts-ignore
export default ( props: MainFormProps ) => <DynamicComponentWithNoSSR {...props}/>
