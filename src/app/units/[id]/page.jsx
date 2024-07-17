"use client";
import TableFormProvider, {useTableForm,} from "@/app/context/TableFormProvider/TableFormProvider";
import {useDataFetcher} from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import {unitInputs} from "@/app/units/unitInputs";
import {Form} from "@/app/UiComponents/FormComponents/Forms/Form";
import {getChangedFields} from "@/helpers/functions/getChangedFields";
import {useAuth} from "@/app/context/AuthProvider/AuthProvider";
import {usePathname} from "next/navigation";
import {getCurrentPrivilege} from "@/helpers/functions/getUserPrivilege";

export default function PropertyPage({params}) {
    const id = params.id;
    return (
          <TableFormProvider url={"fast-handler"}>
              <PropertyWrapper unitId={id}/>
          </TableFormProvider>
    );
}

const PropertyWrapper = ({unitId}) => {
    const {data, loading} = useDataFetcher("main/units/" + unitId);
    const {id, submitData} = useTableForm();
    const {user} = useAuth()
    const pathName = usePathname();

    function canEdit() {
        const currentPrivilege = getCurrentPrivilege(user, pathName);
        return currentPrivilege?.privilege.canEdit;
    }


    const [disabled, setDisabled] = useState({});

    const [reFetch, setRefetch] = useState({});
    const [renderedDefault, setRenderedDefault] = useState(false);

    async function getUnitTypes() {
        const res = await fetch("/api/fast-handler?id=unitType");
        const data = await res.json();

        return {data};
    }

    async function getProperties() {
        const res = await fetch("/api/fast-handler?id=properties");
        const data = await res.json();

        return {data};
    }

    useEffect(() => {
        if (typeof data === "object" && Object.keys(data).length > 0) {
            setRenderedDefault(true);
        }
    }, [loading, data]);
    if (loading) return <div>Loading...</div>;
    if (!renderedDefault) return;
    unitInputs[2] = {
        ...unitInputs[2],
        extraId: false,
        getData: getUnitTypes,
    };
    unitInputs[0] = {
        ...unitInputs[0],
        extraId: false,
        getData: getProperties,
    };
    const dataInputs = unitInputs.map((input) => {
        input = {
            ...input,
            value: data[input.data.id],
        };
        return input;
    });

    async function edit(returnedData) {
        const changedData = getChangedFields(data, returnedData);
        const submit = await submitData(
              changedData,
              null,
              null,
              "PUT",
              null,
              "json",
              "/main/units/" + unitId,
        );
        if (submit) {
            window.setTimeout(() => {
                window.history.back();
            }, 100)
        }
    }

    return (
          <>
              <div className="mb-4">
                  <Form
                        formTitle={"تعديل"}
                        inputs={dataInputs}
                        onSubmit={(data) => {
                            if (canEdit()) {
                                edit(data)
                            }
                        }}
                        disabled={disabled}
                        variant={"outlined"}
                        btnText={"تعديل"}
                        reFetch={reFetch}
                        removeButton={!canEdit()}
                  ></Form>
              </div>
          </>
    );
};
